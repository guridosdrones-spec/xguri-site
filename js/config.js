/* ==========================================================================
   XGuri - CONFIGURACAO DO SITE

   Este e o UNICO arquivo que voce precisa editar no dia a dia.
   Preencha os campos abaixo, salve, e o site inteiro se ajusta.

   Enquanto algum campo obrigatorio estiver vazio, aparece uma tarja amarela
   no topo do site avisando o que falta. Essa tarja some sozinha quando
   tudo estiver preenchido - o cliente nunca a ve num site ja configurado.
   ========================================================================== */

window.XGURI = {

  /* ---------------------------------------------------------- o programa */

  // Versao que esta no ar e a data em que voce publicou.
  versao: "1.0.3",
  lancamento: "2026-09-17",

  // Tamanho aproximado do instalador, do jeito que o cliente le.
  tamanho: "578 MB",

  // O instalador de teste e um arquivo diferente, e maior: o pacote do
  // PyInstaller ja vem compactado, entao o instalador quase nao encolhe.
  // Usado so na teste.html.
  tamanhoTeste: "552 MB",

  // Link direto do instalador (XGuri_Setup_1.0.0.exe).
  // Depois de criar o Release no GitHub, o link tem esta cara:
  // https://github.com/USUARIO/xguri-site/releases/download/v1.0.0/XGuri_Setup_1.0.0.exe
  download: "https://github.com/guridosdrones-spec/xguri-site/releases/download/v1.0.3/XGuri_Setup_1.0.3.exe",

  // -------------------------------------------------------------------
  // PORTAO DE SENHA DO DOWNLOAD
  //
  // Com o portao ativo, o campo `download` acima fica VAZIO: o link do
  // instalador mora aqui embaixo cifrado com a sua senha, e o navegador
  // so consegue monta-lo quando alguem digita a senha certa. Quem abrir
  // o codigo-fonte do site ve um embaralhado, nao a senha nem o link.
  //
  // Para gerar este bloco (ou trocar a senha depois), abra
  // _ferramenta-senha.html no seu computador, secao "Senha do download".
  //
  // ATENCAO, para nao se enganar: o instalador continua sendo um arquivo
  // publico no GitHub Releases. Quem procurar a aba Releases do
  // repositorio baixa sem passar pela senha. Isto aqui filtra curioso,
  // nao e cofre - quem protege o XGuri e a licenca.
  // -------------------------------------------------------------------
  portao: {
    ativo: false,
    iter: 200000,
    sal: "",
    iv: "",
    link: "",

    // Texto que aparece embaixo do campo de senha.
    dica: "Peça a senha no WhatsApp.",
  },

  // -------------------------------------------------------------------
  // PORTAO DA PAGINA DE TESTE (teste.html)
  //
  // Senha e link SEPARADOS do download geral, de proposito: a pagina de
  // teste entrega o XGuri_Teste_3dias, que abre completo por 3 dias e
  // depois se remove da maquina. Se dividisse o link com o portao de
  // cima, voce mandaria a versao definitiva a quem pediu avaliacao.
  //
  // Gere na _ferramenta-senha.html, secao "Senha do download",
  // escolhendo "Pagina de teste" no seletor.
  //
  // Enquanto isto estiver desligado, teste.html nao mostra link nenhum -
  // e nao existe atalho pelo campo `download`.
  // -------------------------------------------------------------------
  portaoTeste: {
    ativo: true,
    iter: 200000,
    sal: "fe821adf7a510ef5d8214bdf230c594e",
    iv: "bc92262ad614c664e938bbc8",
    link: "gIdJR9kSkysn4uoAgW1crj4fS+bxn5QUqsy4WvRm+qU8gSu+PErsLL9GCcATADFyS8Yty6pSt5PGFLxMnbVi7762h+GTKUC6UOaRmSsTs46touDfqFkFZibZK6Ul43hVPL9qvT2XYD3knpzftx+Hg2IUgyeIEG8kahS6",

    dica: "Use a senha que eu te passei.",
  },

  // -------------------------------------------------------------------
  // XGURI PORTATIL (portatil.html) - app Android de mapeamento com drone
  //
  // Senha propria, separada dos portoes do programa de Windows. O APK
  // mora nas Releases de guridosdrones-spec/xguri-portatil-atualizacoes
  // (o mesmo lugar de onde o app busca as atualizacoes sozinho).
  //
  // Versao nova: troque portatilVersao/Tamanho/Sha256 e gere o bloco de
  // novo na _ferramenta-senha.html, escolhendo "XGuri Portatil". Ou
  // aponte o link para .../releases/latest/download/... e nao precisa
  // mexer no bloco a cada versao (so se mudar o nome do arquivo).
  // -------------------------------------------------------------------
  portaoPortatil: {
    ativo: true,
    iter: 200000,
    sal: "3b2bb3b31f6234263cb7d91b43615d72",
    iv: "ae3f18d3a9debfdd9ac94ef6",
    link: "ZZ7azOcr1yN4w6vyxef/DWBT74apuRn4UwKL/viLf/JQNNq4Y4auIT+F4U7xPo7VOqdWD1oShPCHdBdRms2gKFM2ZTV18eRbEEau+KgLT3nuqxh4WUIz3Ld9bd4BZ2GmZtIB32/mFe0rA0NEohRkxYUOxHS/e0PHTWd0CzhGesLczRw=",

    dica: "Peça a senha no WhatsApp.",
  },

  portatilVersao: "0.2.3",
  portatilTamanho: "86 MB",
  portatilSha256: "1adf4a671750cc2d5c701bdd321854d4c5177b920ac2e7c24d2023c689bc6222",

  // Dias que a versao de teste dura antes de se remover sozinha. Tem que
  // bater com "horas" em edicao_teste.json, no projeto do XGuri
  // (72 horas = 3 dias).
  diasDeTeste: 3,

  // SHA-256 do instalador (opcional). Serve para o cliente conferir que
  // baixou o arquivo original. Para descobrir, no PowerShell:
  //   Get-FileHash .\installer_output\XGuri_Setup_1.0.0.exe -Algorithm SHA256
  // Vazio = o site nao mostra essa linha.
  sha256: "24bfa5037b16db24eecb90392ca818d71524e5d5f0c5514b7ea84396a939abfc",

  /* ------------------------------------------------------------- contato */

  // WhatsApp que recebe os pedidos. SO NUMEROS, com 55 e DDD.
  // Exemplo: "5555999998888"
  whatsapp: "5555996898432",

  // E-mail de contato (opcional). Vazio = o site nao mostra e-mail.
  email: "",

  // Usuario do Instagram, sem o @ (opcional).
  instagram: "",

  /* ----------------------------------------------------------- pagamento */

  // Chave Pix mostrada na pagina de compra (opcional).
  // Vazio = o site so diz "combinamos o pagamento no WhatsApp".
  pix: "",
  pixNome: "",

  /* -------------------------------------------------------------- precos */

  // Escreva o preco como voce quer que apareça, por exemplo "R$ 1.800".
  // Deixe null enquanto nao quiser publicar o valor: o site mostra
  // "Sob consulta" e continua funcionando.
  //
  // Os nomes sao os PERIODOS de licenca/chave.py (PLANOS). Quem manda no
  // que a licenca libera e a lista de recursos dentro dela, nao o
  // periodo: da para vender o mapa HD por um dia ou a calibracao por um
  // ano. Por isso aqui e "a partir de" - o valor final depende de
  // quantos modulos a pessoa quer.
  precos: {
    diaria:    null,
    mensal:    null,
    anual:     null,
    vitalicia: null,
  },

  // Horas com TUDO liberado na primeira abertura. Tem que ser igual ao
  // HORAS_DE_AVALIACAO de licenca/edicao.py no programa.
  horasAvaliacao: 24,
};
