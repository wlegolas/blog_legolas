// Iniciando o Socket.io
var io = require('socket.io').listen(8088),
    game = require('game'),
    gm = new game.Game();

io.sockets.on('connection', function (socket) {
	/**
     * Evento disparado para informar o início do Jogo
     * @param {Int} playerId ID do Jogador selecionado
     */
    socket.on('begingame', function(playerId) {
        if(playerId === 0) {
            var playerSelected = gm.getPlayer(),
                title = 'Inimigo selecionado',
                msg = 'O inimigo <b>"PLAYER_NAME"</b> foi selecionado';

            if(gm.getCountSelectedPlayes() === 0) {
                gm.setCurrentPlayer(playerSelected);
            }

            // Adicionando o Jogador
            gm.addPlayer(playerSelected);

        	// Criando o canal com o ID do Jogador
        	socket.join( playerSelected.id );

            // Trocando o nome do Jogador
            msg = msg.replace('PLAYER_NAME', playerSelected.name);

        	// Emit para o outro Jogador a informações que o seu oponente foi selecionado
    		socket.broadcast.emit('enemyselected', title, msg);

            // Informando os dados para o Jogador
            socket.emit('playerselected', playerSelected.id, playerSelected.name);

    		// Verificando se todos os Jogadores iniciaram o Jogo
            if(gm.getCountSelectedPlayes() === 2) {
            	title = 'Jogadores selecionados';
            	msg = 'Todos jogadores foram selecionados, "<b>' + gm.getCurrentPlayer().name + '</b>" irá iniciar o jogo';

            	//  Informando para todos os Jogadores o início do Jogo
                io.sockets.emit('begingameallplayers', title, msg);
            }
        }
    });

    /**
     * Disparando o tiro no inimigo
     * @param {Int} playerId ID do Jogador que efetuou o disparo
     * @param {String}cCellID ID da célula a ser bombardiada
     */ 
    socket.on('shoot', function(playerId, cellID) {
        // Verificando se todos os Jogadores forem selecionados
        if(gm.getCountSelectedPlayes() === 2) {
            var currentPlayer = gm.getCurrentPlayer();

            // Verificando se o ID do Jogador não é o atual Jogador
            if(currentPlayer.id !== playerId) {
                var msg = 'O Jogador <b>' +  currentPlayer.name + '</b> ainda está decidindo a sua jogada';

                // O Jogador não tem permissão para atirar
                socket.emit('error', cellID, msg);

                return false;
            }

            var enemy = gm.getEnemy(playerId),
                id = cellID.replace('offensive_', '#defensive_'),
                msg;

            // Atualizando o valor dos tiros do Jogador
            currentPlayer.shots = currentPlayer.shots - 1;

            // Disparando o evento que irá verificar o tiro no Inimigo
            socket.broadcast.to( enemy.id ).emit('shotfired', playerId, id);
        }
        else {
            // Erro todos os Jogadores não foram selecionado
            socket.emit('error', cellID, 'O seu oponente ainda não foi selecionado.');
        }    	
    });

    /**
     * Evento disparado quando uma célula contém um item (Navio ou bonus)
     * @param {String} item Tipo do item que foi abatido
     * @param {String} cellID ID da Célula abatida
     * @param {Int} ownerShotID ID do Jogador que efetuou o disparo
     * @param {Int} points Valor dos pontos do item abatido
     */
    socket.on('shotsuccess', function(item, cellID, ownerShotID, points) {
        var currentPlayer = gm.getCurrentPlayer(),
            enemy = gm.getEnemy(ownerShotID),
            title = 'Tiro certeiro',
            msg = 'ITEM_NAME abatido na célula <b>' + cellID.replace('#defensive_', '') + '</b>, você ganhou <b>' + points + '</b> pontos!';

        switch (item) {
            case 'ship' :
                msg = msg.replace('ITEM_NAME', 'Navio');
                break;
            case 'bonus' :
                msg = msg.replace('ITEM_NAME', 'Bonus');
                break;
        }

        // Atualizando os pontos do Jogador que disparou o tiro
        currentPlayer.points = currentPlayer.points + points;

        // Informando o sucesso do disparo para o Jogador que disparou o tiro
        socket.broadcast.to( ownerShotID ).emit('shootsuccess', title, msg);

        // Atualizando os dados do Jogador que disparou o tiro
        socket.broadcast.to( ownerShotID ).emit('update', currentPlayer);

        msg = gm.checkEndGame(currentPlayer, enemy);

        // Verificando o fim do Jogo
        if(msg !== '') {
            // Informando a todos Jogadores o final do Jogo
            io.sockets.emit('endgame', 'Jogo encerrado', msg);
        }

        // Alternando os Jogadores
        gm.setCurrentPlayer(enemy);
    });

    /**
     * Evento disparado quando uma célula contém um item (Navio ou bonus)
     * @param {String} cellID ID da Célula abatida
     * @param {Int} ownerShotID ID do Jogador que efetuou o disparo
     */
    socket.on('shoterror', function(cellID, ownerShotID) {
        var currentPlayer = gm.getCurrentPlayer(),
            enemy = gm.getEnemy(ownerShotID),
            title = 'Tiro na água',
            msg = 'Tiro disparado na célula <b>' + cellID.replace('#defensive_', '') + '</b>, nunhum navio foi atingido';

        // Informando o Jogador que efetuou o disparo sobre o erro no tiro
        socket.broadcast.to( ownerShotID ).emit('shooterror', title, msg);

        // Atualizando os dados do Jogador
        socket.broadcast.to( ownerShotID ).emit('update', currentPlayer);

        msg = gm.checkEndGame(currentPlayer, enemy);

        // Verificando o fim do Jogo
        if(msg !== '') {
            // Informando a todos Jogadores o final do Jogo
            io.sockets.emit('endgame', 'Jogo encerrado', msg);
        }

        // Alternando os Jogadores
        gm.setCurrentPlayer(enemy);
    });

    /**
     * Evento disparado quando um Jogador decide encerrar o Jogo
     * @param {Int} playerId ID do Jogador que efetuou a solicitação
     */
    socket.on('closegame', function(playerId) {
        var player = gm.getPlayerById(playerId),
            msg = 'O Jogador <b>' + player.name + '</b> desistiu do Jogo';

        // Informando a todos Jogadores o final do Jogo
        io.sockets.emit('endgame', 'Jogo encerrado', msg);
    });
});