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
  versao: "1.0.0",
  lancamento: "2026-09-15",

  // Tamanho aproximado do instalador, do jeito que o cliente le.
  tamanho: "480 MB",

  // Link direto do instalador (XGuri_Setup_1.0.0.exe).
  // Depois de criar o Release no GitHub, o link tem esta cara:
  // https://github.com/USUARIO/xguri-site/releases/download/v1.0.0/XGuri_Setup_1.0.0.exe
  download: "",

  // SHA-256 do instalador (opcional). Serve para o cliente conferir que
  // baixou o arquivo original. Para descobrir, no PowerShell:
  //   Get-FileHash .\installer_output\XGuri_Setup_1.0.0.exe -Algorithm SHA256
  // Vazio = o site nao mostra essa linha.
  sha256: "",

  /* ------------------------------------------------------------- contato */

  // WhatsApp que recebe os pedidos. SO NUMEROS, com 55 e DDD.
  // Exemplo: "5555999998888"
  whatsapp: "",

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
  precos: {
    assinatura: null,   // 1 ano, todos os modulos
    vitalicia:  null,   // sem validade
    modulo:     null,   // um modulo avulso, por ano
  },

  // Dias de avaliacao gratuita. Tem que ser igual ao
  // DIAS_DE_AVALIACAO de licenca/armazenamento.py no programa.
  diasAvaliacao: 15,
};
