$(document).ready(function(){
	// Objeto com os dados para serem preenchidos no Formulário
	var objeto1 = {
		 'nome'			: 'Weslley Alves'
		,'email'		: 'wesshead@gmail.com'
		,'sexo'			: 'M'
		,'ativo'		: 1
		,'estadocivil'	: 1
		,'observacao'	: 'Esse texto foi inserido dinâmicamente pelo Plugin!!!'
	};
	
	// Objeto com os dados para serem preenchidos no Formulário
	var objeto2 = {
		 'nome'			: 'Ifitrini Helm'
		,'email'		: 'ifitrini@gmail.com'
		,'sexo'			: 'F'
		,'ativo'		: 0
		,'estadocivil'	: 3
		,'observacao'	: 'Texto atualizado através do object!!!'
	};
	
	// Monitorando o evento Click do primeiro botão do Formulário
	$('#btn-carregar-1').bind('click', function(e){
		// Parando a ação do botão
		e.preventDefault();
		
		// Carregando os ddos no Formulário
		$('form').loadData(objeto1);
	});
	
	// Monitorando o evento Click do segundo botão do Formulário
	$('#btn-carregar-2').bind('click', function(e){
		// Parando a ação do botão
		e.preventDefault();
		
		// Carregando os ddos no Formulário
		$('form').loadData(objeto2);
	});
});