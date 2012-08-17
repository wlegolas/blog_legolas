( function( $ ){
    
    $(document).ready(function(){
        var game = new Game(),
            clsShips = 'bship-ship',
            clsGridDisabled = 'bship-disable',
            clsDisabledGrid = 'bship-disable',
            clsSelectedCell = 'bship-selected-cell',
            maxShips = game.getMaxShips(),
            gridDefensive = $('#grid-defensive'),
            gridOffensive = $('#grid-offensive'),
            cellsDefensive = gridDefensive.find('td:not(.bship-legend)'),
            cellsOffensive = gridOffensive.find('td:not(.bship-legend)'),
            inputShipsEl = $('#ships'),
            inputShotsEl = $('#shot'),
            btnBeginGame = $('#btn-begin-game'),
            btnCloseGame = $('#btn-close-game');

        // Iniciando o jogo
        game.init();
        
        /**
         * Atachando os eventos nos elementos
         */
       
        // Solicitando o início do Jogo
        $(btnBeginGame).on('click', function(){
            var numShips = inputShipsEl.val();
            
            if(numShips == 0) {
                // Removendo o evento atachado nas células defensivas
                $(cellsDefensive).off('click');
                
                // Iniciando o Jogo
                game.beginGame();
            } 
            else {
                game.showMessage('Selecionar navios', 'Todos os navios não foram adicionados');
            }
        });
        
        // Solicitando o final do Jogo
        $(btnCloseGame).on('click', function(){
            game.closeGame();
        });
       
        // Alterne a classe CSS das linhas
        $(cellsDefensive).on('click', function(){
            var td = $(this),
                disabled = gridDefensive.hasClass(clsGridDisabled),
                countShips = inputShipsEl.val(),
                cellsWithClsShip;

            if(!disabled) {
                // Alernar a classe CSS do navio
                td.toggleClass(clsShips);

                // Resgatano o número de navios inseridos no Grid
                cellsWithClsShip = gridDefensive.find('td.bship-ship');
                countShips = maxShips - cellsWithClsShip.length;

                // Removendo a Classe CSS quando todos navios foram inseridos
                if(countShips < 0) {
                    countShips = 0;
                    td.removeClass(clsShips);
                }

                // Atualizando o número restantes de navios
                game.updateShips(countShips)
            }
        });
        
        // Disparando o tiro no inimigo
        $(cellsOffensive).on('click', function(){
            var td = $(this),
                id = td.attr('id'),
                disabled = gridOffensive.hasClass(clsGridDisabled),
                selected = td.hasClass(clsSelectedCell),
                numShots = inputShotsEl.val();

            // Verificando se o jogador pode atirar
            if(!disabled && !selected && numShots > 0) {
                // Atualizando o número de tiros
                game.updateShots(numShots - 1);

                // Enviando o ID da célula selecionada
                game.shoot(id);
            }
        });     
    });
    
})( jQuery );