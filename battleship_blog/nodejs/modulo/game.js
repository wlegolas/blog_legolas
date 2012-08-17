/**
 * Classe que irá criar o gerenciamento do jogo no lado server
 * @author Legolas Kun
 * @since 2012-08-13
 */
var Game = function() {
    var me = this;

    /**
     * @cfg Array
     * Array com os jogadores selecionados
     */
    me.playersSelecteds = [];

    /**
     * @cfg Object
     * Objeto com o player que está decidindo a jogada
     */
    me.currentPlayer = null;

    /**
     * @cfg Array
     * Array com os dois possíveis jogados do Jogo
     */
    me._players = [{
         id: 1
        ,name: 'Capt. Jack Sparrow'
        ,points: 0
        ,shots: 2
    }, {
         id: 2
        ,name: 'Capt. Gancho'
        ,points: 0
        ,shots: 2
    }];

    /**
     * Método que irá retornar o número de players selecionados
     * @return {Int} Retorna o número de players selecionados
     */
    me.getCountSelectedPlayes = function() {
        return this.playersSelecteds.length;
    };

    /**
     * Método que irá retornar o player a ser selecionado
     * @return {Object} Retorna o player a ser selecionado
     */
    me.getPlayer = function() {
        return this._players[this.getCountSelectedPlayes()];
    };

    /**
     * Método que irá retornar o player referente ao index
     * @param {Int} playerId ID do Jogador a ser resgatado
     * @return {Object} Retorna o Objeto do Jogador
     */
    me.getPlayerById = function(playerId) {
        var playersSelecteds = this.playersSelecteds;

        for(var i = 0; i < this.getCountSelectedPlayes(); i++) {
            if(playersSelecteds[i].id === playerId) {
                return playersSelecteds[i];
            }
        }
    };

    /**
     * Adicionando o jogador selecionado
     * @param {Object} playerSelected Objeto do player que foi selecionado
     */
    me.addPlayer = function(playerSelected) {
        this.playersSelecteds.push(playerSelected);
    };

    /**
     * Informando o atual Jogador
     * @param {Object} currentPlayer Objeto do atual player
     */
    me.setCurrentPlayer = function(currentPlayer) {
        this.currentPlayer = currentPlayer;
    };

    /**
     * Resgatando o Jogador atual
     * @return {Object} Retorna o Object do atual Jogador
     */
    me.getCurrentPlayer = function() {
        return this.currentPlayer;
    };    

    /**
     * Método que irá resgatar o inimigo do player
     * @param {Int} playerID ID do Jogador a ser resgatado o seu oponente
     * @return {Object/Int} Retorna o Objeto com os dados do Jogador oponente 
     *  ou -1 caso não tenha o player pelo ID
     */
    me.getEnemy = function(playerId) {
        var me = this,
            playersSelecteds = me.playersSelecteds;

        for(var i = 0; i < me.getCountSelectedPlayes(); i++) {
            if(playersSelecteds[i].id !== playerId) {
                return playersSelecteds[i];
            }
        }
        return -1;
    };

    /**
     * Método que irá verificar o fim do Jogo
     * @param {ObjectIo} io Objeto socket
     * @param {Object} currentPlayer Objeto do Jogador atual
     * @param {Object} enemyPlayer Objeto do inimigo do Jogador atual
     */
    me.checkEndGame = function(currentPlayer, enemyPlayer) {
        var currentPoints = currentPlayer.points,
            enemyPoints = enemyPlayer.points,
            msg = '';

        // Verificando o final do Jogo
        if(currentPlayer.shots === 0 && enemyPlayer.shots === 0) {
            // Mensagem padrão
            msg = 'Empate, os dois Jogadores possuem <b>' + currentPoints + '</b> pontos';

            // Verificando o vencedor do Jogo
            if(currentPoints > enemyPoints) {
                msg = 'O jogodor <b>' + currentPlayer.name + '</b> é o vencedor com <b>' + currentPoints + '</b> pontos';
            } else if(enemyPoints > currentPoints) {
                msg = 'O jogodor <b>' + enemyPlayer.name + '</b> é o vencedor com <b>' + enemyPoints + '</b> pontos';
            }
        }

        return msg;
    };
}

exports.Game = Game;