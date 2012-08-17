/* 
 * Esta classe irá interar no jogo atualizando os dados do jogador, emitindo os
 * eventos para o server e controlando as jogadas. 
 * @author Weslley Alves
 * @contact wesshead@gmail.com
 * @date 05/07/2012
 * @version v0.1
 */
( function( $ ){
    
    /**
     * Classe do Jogo
     */
    Game = function() {
        var me = this;
        
        /**
         * @cfg {String} playerId
         * ID do Jogador selecionado
         */
        me.playerId = null
        
        /**
         * @cfg {Bool} enabled
         * Status do jogo
         */
        me.enabled = false;
        
        /**
         * @cfg {String} clsShips
         * Classe CSS dos navios
         */
        me.clsShips = 'bship-ship';
        
        /**
         * @cfg {String} clsShotDown
         * Classe CSS dos navios que foram abatidos
         */
        me.clsShotDown = 'ship-shot-down';
        
        /**
         * @cfg {String} clsTarget
         * Classe CSS do icon para a célula offensiva selecionada
         */
        me.clsTarget = 'bship-target';
        
        /**
         * @cfg {String} clsBonusItem
         * Classe CSS das células com Bonus
         */
        me.clsBonusItem = 'bship-bonus';        
        
        /**
         * @cfg {String} clsGridDisabled
         * Classe CSS dos Grids desabilitados
         */
        me.clsGridDisabled = 'bship-disable';
        
        /**
         * @cfg {String} shipShotDownElTpl
         * Templade HTML do elemento dos navios abatidos
         */
        me.shipShotDownElTpl = '<div class="bship-icon-ship-shot-down"></div>';
        
        /**
         * @cfg {String} cellSelectedElTpl
         * Templade HTML para as células ofensivas selecionadas
         */
        me.cellSelectedElTpl = '<div class="bship-cell-icon"></div>';
        
        /**
         * @cfg {Int} maxShips
         * Valor máximo de Navios no Jogo
         */
        me.maxShips = 2;
        
        /**
         * @cfg {Int} maxShots
         * Valor máximo de tiros para o Jogodor
         */
        me.maxShots = 2;
        
        /**
         * @cfg {Int} maxBonusItems
         * Value of max bonus items in the Game
         */
        me.maxBonusItems = 5;
        
        /**
         * @cfg {HTMLElement} inputShipsEl
         * Element HTML do campo com o valor máximo de Navios
         */
        me.inputShipsEl = $('#ships');
        
        /**
         * @cfg {HTMLElement} inputShotEl
         * Element HTML do campo com o valor dos tiros
         */
        me.inputShotEl = $('#shot');
        
        /**
         * @cfg {HTMLElement} inputPointsEl
         * Element HTML do campo com o valor dos tiros
         */
        me.inputPointsEl = $('#score');
        
        /**
         * @cfg {HTMLElement} inputPlayerEl
         * Element HTML do campo com o valor do ID do Jogador selecionado
         */
        me.inputPlayerIdEl = $('#playerId');
        
        /**
         * @cfg {HTMLElement} inputPlayerEl
         * Element HTML do campo com o valor do Jogador selecionado
         */
        me.inputPlayerEl = $('#player');
        
        /**
         * @cfg {HTMLElement} gridDefensiveEl
         * Element HTML do Grid de defesa
         */
        me.gridDefensiveEl = $('#grid-defensive');
        
        /**
         * @cfg {HTMLElement} gridOffensiveEl
         * Element HTML do Grid de ataque
         */
        me.gridOffensiveEl = $('#grid-offensive');
        
        /**
         * @cfg {HTMLElement} cellsOffensiveEl
         * Element HTML das células do Grid de ataque
         */
        me.cellsOffensiveEl = me.gridOffensiveEl.find('td:not(.bship-legend)');
        
        /**
         * @cfg {HTMLElement} btnCloseGameEl
         * Element HTML do Botão para Encerrar o Jogo
         */
        me.btnBeginGameEl = $('#btn-begin-game');
        
        /**
         * @cfg {HTMLElement} btnCloseGameEl
         * Element HTML do Botão para Encerrar o Jogo
         */
        me.btnCloseGameEl = $('#btn-close-game');
        
        /**
         * @cfg {Object} defaultConfigForGrowlMsg
         * Objeto com as configurações para as mensagens do jGrowl
         */
        me.defaultConfigForGrowlMsg = {
             life: 5000
            ,position: 'center'
        };
        
        /**
         * @cfg {Array} bonusItems
         * Objeto com os items de bonus para o Jogo
         */
        me.bonusItems = [
             {id: 1, name: 'point', point: 60, clsBonus: 'bship-bonus bship-trophy-gold'}
            ,{id: 2, name: 'shot', point: 100, clsBonus: 'bship-bonus bship-manche'}
        ];
        
        /**
         * Inicializando o Jogo
         * @param {Object} configs Configurações para serem aplicadas na Classe
         */
        me.init = function(configs) {
            var me = this;

            $.extend(me, configs);
            
            // Ocultando o botão de encerramento do Jogo
            me.btnCloseGameEl.hide();
            
            // Atualizando os valores máximos do Jogo
            me.inputShipsEl.val(me.getMaxShips());
            me.inputShotEl.val(me.getMaxShots());
            
            // Resgatando o ID do Jogador
            me.playerId = me.inputPlayerIdEl.val();

            // Instância o objeto do Socket.io
            me.socket = new SocketIO();

            // Inicializnado os events listeners do NodeJS
            me.initEvents();
        };
        
        /**
         * Método que irá executar a função pelo escopo informado
         * @param {Function} fn Função que deverá ser executada
         * @param {Object} scope Escopo de execução da função
         * @return {Function} Retorna a função a ser execudada no scopo informado
         */
        me.bindFn = function(fn, scope) {
            return function() {         
                return fn.apply(scope, arguments);
            }
        };
        
        /**
         * Inicializando os events listeners para monitorar os eventos 
         * disparados pelo NodeJS com Socket.io
         */
        me.initEvents = function() {
            var me = this,
                socket = me.socket;
            
            // Informando o Jogador selecionado pelo Server
            socket.addEventListener('playerselected', me.bindFn(me.playerSelected, me));
            
            // Exibindo a mensagem do inimigo selecionado
            socket.addEventListener('enemyselected', me.bindFn(me.showMessage, me));
            
            // Exibindo a mensagem quando todos os Jogadores forem selecionados
            socket.addEventListener('begingameallplayers', me.bindFn(me.showMessage, me));
            
            // Evento para verificar o tiro disparado pelo Inimigo          
            socket.addEventListener('shotfired', me.bindFn(me.shotFired, me));
            
            // Evento disparado quando o Jogador aceta uma célula com algum item
            socket.addEventListener('shootsuccess', me.bindFn(me.showMessage, me));
            
            // Evento disparado quando o Jogador erra o tiro
            socket.addEventListener('shooterror', me.bindFn(me.showMessage, me));
            
            // Evento disparado para atualizar os dados do Jogador
            socket.addEventListener('update', me.bindFn(me.update, me));
            
            // Evento disparado quando o Jogo é encerrado
            socket.addEventListener('endgame', me.bindFn(me.endGame, me));
            
            // Evento disparado quando ocorrer qualquer erro
            socket.addEventListener('error', me.bindFn(me.rollbackShoot, me));
        };
        
        /**
         * Método que irá adicionar as células de bonus
         * @return {Void}
         */
        me.addBonusItems = function() {
            var me = this,
                cellsWhitoutShip = me.gridDefensiveEl.find('td:not(.bship-legend,.bship-ship)'),
                countCells = cellsWhitoutShip.length,
                countBonusItems = me.bonusItems.length,
                indexTd, indexBonusItem, clsBonusItem, idBonusItem;
                
            if(countCells > 0 && (countCells > me.maxBonusItems)) {
                // LOOP para adicionar os items de bonus nas células sem Navios
                for(var i = 0; i < me.maxBonusItems; i++) {
                    // Fake AI
                    indexTd = Math.floor((Math.random() * countCells) + 1) - 1;
                    indexBonusItem = Math.floor((Math.random() * countBonusItems) + 1) - 1;
                    
                    // Resgatando a Classe CSS do Bonus e o ID
                    clsBonusItem = me.bonusItems[indexBonusItem].clsBonus;
                    idBonusItem = me.bonusItems[indexBonusItem].id;

                    // Adicionando a Classe CSS informando que a célula contém Bonus
                    $( cellsWhitoutShip[indexTd] ).addClass(clsBonusItem).attr('itemId', idBonusItem);
                }
            }
        };
        
        /**
         * Iniciando o Jogo
         * @return {Bool} Retorna "true" se o outro jogador também iniciou o jogo
         */
        me.beginGame = function() {
            var me = this;

            // Adicioando os itens de bonus
            me.addBonusItems();
            
            // Ocultando o botão do início do Jogo
            me.btnBeginGameEl.hide();

            // Exibindo o botão para encerrar o Jogo
            me.btnCloseGameEl.show();

            // Habilitando e Desabilitando os Grids de Ataque e Defesa
            me.gridDefensiveEl.addClass(me.clsGridDisabled);
            me.gridOffensiveEl.removeClass(me.clsGridDisabled);
            
            // Armazenando o ID do Jogador
            me.playerId = parseInt(me.inputPlayerIdEl.val());

            // Disparando o evento para iniciar o Jogo
            me.socket.fireEvent('begingame', me.playerId);
        };
        
        /**
         * Encerrando o Jogo
         */
        me.endGame = function(title, msg) {
            var me = this;
            
            // Removendo o evento atachado nas células defensivas
            me.cellsOffensiveEl.off('click');
            
            // Ocultando o botão do Fim do Jogo
            me.btnCloseGameEl.hide();
            
            // Exibindo a mensagem
            me.showMessage(title, msg);
        };
        
        /**
         * Solicitação do encerramento do Jogo pelo Jogador
         */
        me.closeGame = function() {
            var me = this,
                playerId = parseInt(me.inputPlayerIdEl.val());
            
            // Emitindo o evento para o servidor
            me.socket.fireEvent('closegame', playerId);
        }
        
        /**
         * Disparando o tiro no inimigo
         * @param {Int} id ID da célula ofensiva selecionada
         */
        me.shoot = function(id) {
            var me = this,
                cellSelectedEl,
                td = $('#' + id),
                playerId = parseInt(me.inputPlayerIdEl.val());

            // Adicionando o Elemento HTML para informar a célula selecionada
            cellSelectedEl = $(me.cellSelectedElTpl).addClass(me.clsTarget);
            td.html(cellSelectedEl);

            // Emitindo o evento para o servidor
            me.socket.fireEvent('shoot', playerId, id);
        }
        
        /**
         * Atualiza o valor do campo com o número de Navios
         * @param {Int} ships Número de Navios a ser atualizado
         */
        me.updateShips = function(ships) {
            this.inputShipsEl.val(ships);
        };
        
        /**
         * Atualiza o valor do campo com o número de Tiros
         * @param {Int} shots Número de tiros para ser atualizado
         */
        me.updateShots = function(shots) {
            this.inputShotEl.val(shots);
        };
        
        /**
         * Atualiza o valor do campo com o número dos Pontos
         * @param {Int} points Número dos pontos para ser atualizado
         */
        me.updatePoints = function(points) {
            this.inputPointsEl.val(points);
        };
        
        /**
         * Resgatando o valor máximo de Navios
         * @return {Int} Retorna o valor máximo de Navios para o Jogo
         */
        me.getMaxShips = function() {
            return this.maxShips;
        };      
        
        /**
         * Resgatando o valor máximo de Tiros
         * @return {Int} Retorna o valor máximo de tiros para o Jogo
         */
        me.getMaxShots = function() {
            return this.maxShots;
        };
        
        /**
         * Métodos para os events listeners disparador pelo NodeJS
         */
        
        /**
         * Método que irá atualizar os dados do Jogador e exibir a mensagem
         * com o nome do Jogador selecionado pelo Server.
         * @param {Int} playerId ID do Jogador selecionado
         * @param {String} playerName Nome do Jogador selecionado
         */
        me.playerSelected = function(playerId, playerName) {
            var me = this;

            me.playerId = parseInt(playerId);
            
            // Atualizando os valores nos campos
            me.inputPlayerIdEl.val(playerId);
            me.inputPlayerEl.val(playerName);
            
            // Exibindo a mensagem
            me.showMessage('Jogador selecionado', 'O jogador <b>' + playerName + '</b> foi selecionado!');
        }
        
        /**
         * Método que irá exibir a mensagem para o Jogador
         * @param {String} title Título da mensagem
         * @param {String} msg Texto da mensagem a ser exibida
         */
        me.showMessage = function(title, msg) {
            var cfgGrowlMsg = $.extend(me.defaultConfigForGrowlMsg, {header: title});

            // Exibindo a mensagem
            $.jGrowl(msg, cfgGrowlMsg);
        }
        
        /**
         * Verificando o tiro disparado pelo Inimigo
         * @param {Int} playerId ID do Jogador que disparou o tiro
         * @param {String} id ID da célular selecionada pelo Inimigo
         */
        me.shotFired = function(playerId, id) {
            var me = this,
                td = $(id),
                hasShip = td.hasClass(me.clsShips),
                hasBonus = td.hasClass(me.clsBonusItem),
                itemId = parseInt(td.attr('itemId')),
                points = 0, title, msg;

            // Adicionando as classes CSS na célula atingida
            td.addClass(me.clsShotDown)
            td.html(me.shipShotDownElTpl);

            // Verificando se o navio foi abatido
            if(hasShip) {
                // Valor default para o ponto
                points = 50;
                
                // Criando o texto para a mensagem
                title = 'Navio atingido';
                msg = 'Navio atingido na célula <b>' + id.replace('#defensive_', '') + '</b>';

                // Célula abatida
                me.socket.fireEvent('shotsuccess', 'ship', id, playerId, points);
            } else if(hasBonus) {
                // Resgatando os pontos do Bonus abatido
                points = me.getBonusPoint(itemId);

                // Criando o texto para a mensagem
                title = 'Bonus atingido';
                msg = 'Bonus atingido na célula <b>' + id.replace('#defensive_', '') + '</b>';
                
                // Bonus abatido
                me.socket.fireEvent('shotsuccess', 'bonus', id, playerId, points);
            } else {
                // Criando o texto para a mensagem
                title = 'Tiro na água';
                msg = 'Foi disparado um tiro na célula <b>' + id.replace('#defensive_', '') + '</b>';
                
                // Informando que não foi atingido nenhum item              
                me.socket.fireEvent('shoterror', id, playerId);
            }
            
            // Exibindo a mensagem
            me.showMessage(title, msg);
        }
        
        /**
         * Método que irá resgatar o valor dos pontos do item de bonus
         * @param {Int} itemId ID do item de bonus que foi atingido
         * @return {Int} Retorna o valor em pontos do item
         */
        me.getBonusPoint = function(itemId) {
            var me = this,
                bonusItems = me.bonusItems;

            for(var i = 0; i < bonusItems.length; i++) {
                if(bonusItems[i].id == itemId) {
                    return bonusItems[i].point;
                }
            }

            return 0;
        }
        
        /**
         * Executando um roolback nos items do Jogador quando um disparo sem permissão é disparado
         * @param {String} cellID ID da Célula que foi disparada o tiro sem permissão
         * @param {String} msg Mensagem a ser exibida para o Jogador informando o erro
         */
        me.rollbackShoot = function(cellID, msg) {
            var me = this,
                td = $('#' + cellID),
                inputShots = $('#shot'),
                shots = parseInt(inputShots.val()),
                title = 'Jogo em standby',
                cfgGrowlMsg = $.extend(me.defaultConfigForGrowlMsg, {header: title});

            $.jGrowl(msg, cfgGrowlMsg);
            
            // Removendo o Elemento com o icone do alvo
            td.html('');
            
            // Adicionando o valor do tiro
            inputShots.val(shots + 1);
        }
        
        /**
         * Atualizando os dados do Jogador
         * @param {Object} player Objeto com os dados do Jogador
         */
        me.update = function(player) {
            var me = this;
            
            // Atualizando os valores do Jogador
            me.updateShots(player.shots);
            me.updatePoints(player.points);
        }
    }
})( jQuery );