/* ==========================================================================
   XGuri - comportamento do site

   Nada aqui precisa de servidor: o site e feito de arquivos estaticos.
   Os pedidos saem pelo WhatsApp do cliente, ja escritos e conferidos,
   e a licenca continua sendo emitida na sua maquina, com a chave privada
   que nunca sai de la.
   ========================================================================== */

(function () {
  "use strict";

  var C = window.XGURI || {};

  /* ------------------------------------------------------------ utilidades */

  function todos(seletor) {
    return Array.prototype.slice.call(document.querySelectorAll(seletor));
  }

  function texto(valor) {
    return (valor === null || valor === undefined) ? "" : String(valor).trim();
  }

  function whatsappLink(mensagem) {
    var numero = texto(C.whatsapp).replace(/\D/g, "");
    if (!numero) return "";
    var base = "https://wa.me/" + numero;
    return mensagem ? base + "?text=" + encodeURIComponent(mensagem) : base;
  }

  /* --------------------------------------------------- preencher a pagina */

  function preencherTextos() {
    todos("[data-cfg]").forEach(function (el) {
      var chave = el.getAttribute("data-cfg");
      var valor = texto(C[chave]);
      if (valor) el.textContent = valor;
    });

    todos("[data-preco]").forEach(function (el) {
      var valor = texto((C.precos || {})[el.getAttribute("data-preco")]);
      el.textContent = valor || "Sob consulta";
    });

    todos("[data-ano]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /*
     Botoes de download. Cada um diz de onde vem o link dele:

       data-download             do campo `download` (instalador definitivo)
       data-download="portao"    so da senha do portao geral
       data-download="portaoTeste"  so da senha da pagina de teste

     Isso nao e firula: sem essa separacao, a pagina de teste poderia
     entregar o instalador definitivo a quem pediu so uma avaliacao.
  */

  function botoesDeDownload(nome) {
    return todos("[data-download]").filter(function (el) {
      var de = (el.getAttribute("data-download") || "").trim();

      if (!nome) return de === "";

      return de === nome || (nome === "portao" && de === "");
    });
  }

  function trancar(el) {
    el.setAttribute("href", "#");
    el.setAttribute("aria-disabled", "true");
    el.addEventListener("click", function (ev) {
      if (el.getAttribute("aria-disabled") === "true") ev.preventDefault();
    });
  }

  function preencherDownloads() {
    var link = texto(C.download);

    // Só os botões sem origem declarada saem do campo `download`.
    botoesDeDownload(null).forEach(function (el) {
      if (link) {
        el.setAttribute("href", link);
        el.removeAttribute("aria-disabled");
        return;
      }
      trancar(el);
    });

    // Os que dependem de senha começam trancados, sempre.
    todos("[data-download]").forEach(function (el) {
      if ((el.getAttribute("data-download") || "").trim()) trancar(el);
    });
  }

  function preencherWhatsapp() {
    var numero = texto(C.whatsapp).replace(/\D/g, "");

    todos("[data-wa]").forEach(function (el) {
      var mensagem = el.getAttribute("data-wa-texto") || "";
      var link = whatsappLink(mensagem);

      if (link) {
        el.setAttribute("href", link);
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener");
        el.removeAttribute("aria-disabled");
      } else {
        el.setAttribute("href", "#");
        el.setAttribute("aria-disabled", "true");
      }
    });

    // Numero escrito na tela, em formato legivel: (55) 99999-8888
    todos("[data-wa-numero]").forEach(function (el) {
      if (!numero) { el.textContent = "a definir"; return; }
      var sem55 = numero.replace(/^55/, "");
      var ddd = sem55.slice(0, 2);
      var resto = sem55.slice(2);
      var meio = resto.length > 8 ? resto.slice(0, 5) : resto.slice(0, 4);
      el.textContent = "(" + ddd + ") " + meio + "-" + resto.slice(meio.length);
    });
  }

  /* ============================================================
     PORTAO DE SENHA DO DOWNLOAD

     Mesma ideia da portaria do treinamento, com uma diferenca: aqui a
     senha nao e apenas conferida, ela DECIFRA o link do instalador.
     Por isso o codigo-fonte do site nao tem a senha nem o endereco do
     arquivo - so um embaralhado que sem a senha nao abre.
     ============================================================ */

  /*
     Existem dois portoes, com senhas e links diferentes:

       portao       download geral, na download.html
       portaoTeste  versao de teste de 3 dias, na teste.html

     Qual deles a pagina usa esta escrito no proprio formulario, em
     data-portao. Sem valor = "portao".
  */

  var LEMBRAR_DOWNLOAD = {
    portao: "xguri_download_v1",
    portaoTeste: "xguri_download_teste_v1",
    // Com a versão no nome: link guardado de versão velha não vale mais.
    portaoPortatil: "xguri_download_portatil_" + (C.portatilVersao || "v1"),
  };

  function portaoAtivo(nome) {
    var p = C[nome || "portao"] || {};
    return !!(p.ativo && p.sal && p.iv && p.link);
  }

  function nomeDoPortaoDaPagina() {
    var caixa = document.querySelector("[data-portao]");

    if (!caixa) return "";

    return (caixa.getAttribute("data-portao") || "").trim() || "portao";
  }

  function bytesDeHex(h) {
    var t = String(h);
    var a = new Uint8Array(t.length / 2);
    for (var i = 0; i < a.length; i++) a[i] = parseInt(t.substr(i * 2, 2), 16);
    return a;
  }

  function bytesDeBase64(b64) {
    var bruto = atob(String(b64));
    var a = new Uint8Array(bruto.length);
    for (var i = 0; i < bruto.length; i++) a[i] = bruto.charCodeAt(i);
    return a;
  }

  async function decifrarLink(senha, nome) {
    var p = C[nome] || {};

    var base = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode(senha), "PBKDF2", false, ["deriveKey"]
    );

    var chave = await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: bytesDeHex(p.sal), iterations: p.iter || 200000, hash: "SHA-256" },
      base,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    var aberto = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: bytesDeHex(p.iv) }, chave, bytesDeBase64(p.link)
    );

    var link = new TextDecoder().decode(aberto);

    return /^https?:\/\//i.test(link) ? link : "";
  }

  function liberarDownload(link, nome, guardar) {
    if (guardar) {
      try { localStorage.setItem(LEMBRAR_DOWNLOAD[nome], link); } catch (e) {}
    }

    botoesDeDownload(nome).forEach(function (el) {
      el.setAttribute("href", link);
      el.removeAttribute("aria-disabled");
    });

    todos("[data-portao]").forEach(function (el) { el.classList.add("oculto"); });
    todos("[data-portao-liberado]").forEach(function (el) { el.classList.remove("oculto"); });
    todos("[data-some-ao-liberar]").forEach(function (el) { el.classList.add("oculto"); });
  }

  /*
     Botao de download que depende de senha fica visivel desde o inicio.
     Tocar nele antes da senha nao baixa nada: leva para o campo de senha,
     com um recado. Assim quem abre o link ve logo o botao que procura.
  */

  function prepararBotoesTrancados() {
    var campo = document.getElementById("senha-download");
    var erro = document.getElementById("erro-portao");
    var form = document.getElementById("form-portao");

    if (!campo || !form) return;

    todos("[data-download]").forEach(function (el) {
      if (!(el.getAttribute("data-download") || "").trim()) return;

      el.addEventListener("click", function (ev) {
        if (el.getAttribute("aria-disabled") !== "true") return;
        if (form.classList.contains("oculto")) return;

        ev.preventDefault();
        campo.scrollIntoView({ behavior: "smooth", block: "center" });
        campo.focus();
        if (erro) erro.textContent = "Digite aqui a senha para liberar o download.";
      });
    });
  }

  /*
     O XGuri so instala em Windows. No celular, no tablet ou no Mac a pagina
     nao oferece download nenhum: esconde botoes e senha e mostra um recado
     para abrir o link no computador, com atalho para mandar o link pelo
     WhatsApp para si mesmo.
  */

  function avisarSeNaoForWindows() {
    var avisos = todos("[data-nao-windows]");

    if (!avisos.length) return;

    var agente = navigator.userAgent || "";

    if (/Windows/i.test(agente)) return;

    var celular = /iPhone|iPad|iPod|Android|Mobile/i.test(agente) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    var link = location.origin + location.pathname;

    todos("[data-so-windows]").forEach(function (el) { el.classList.add("oculto"); });

    avisos.forEach(function (aviso) {
      var titulo = aviso.querySelector("[data-nao-windows-titulo]");
      if (titulo) {
        titulo.textContent = celular
          ? "Você está no celular."
          : "Este computador não é Windows.";
      }

      var enviar = aviso.querySelector("[data-enviar-link]");
      if (enviar) {
        enviar.setAttribute(
          "href",
          "https://wa.me/?text=" + encodeURIComponent(
            "Link do XGuri para abrir no computador: " + link
          )
        );
      }

      var copiar = aviso.querySelector("[data-copiar-link]");
      if (copiar) {
        copiar.addEventListener("click", function () {
          var pronto = function (ok) {
            copiar.textContent = ok ? "Link copiado" : link;
          };
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(link).then(
              function () { pronto(true); },
              function () { pronto(false); }
            );
          } else {
            pronto(false);
          }
        });
      }

      aviso.classList.remove("oculto");
    });
  }

  function montarPortao() {
    var caixa = document.querySelector("[data-portao]");

    if (!caixa) return;

    var nome = nomeDoPortaoDaPagina();

    // Portao desligado.
    if (!portaoAtivo(nome)) {
      caixa.classList.add("oculto");

      // No download geral, sem senha a pagina funciona como antes: o
      // botao sai direto do campo `download`. Na pagina de teste nao
      // existe esse atalho - sem a senha configurada nao ha link, e o
      // botao sai da frente em vez de ficar ali sem funcionar.
      // Portatil sem senha (fase de teste): o link direto vem do config.
      if (nome === "portaoPortatil" && texto(C.portatilDownload)) {
        liberarDownload(texto(C.portatilDownload), nome, false);
        return;
      }

      if (nome === "portao") {
        todos("[data-portao-liberado]").forEach(function (el) {
          el.classList.remove("oculto");
        });
      } else {
        todos("[data-portao-liberado]").forEach(function (el) {
          el.classList.add("oculto");
        });
        todos("[data-sem-portao]").forEach(function (el) {
          el.classList.remove("oculto");
        });
      }
      return;
    }

    caixa.classList.remove("oculto");
    todos("[data-portao-liberado]").forEach(function (el) { el.classList.add("oculto"); });

    todos("[data-portao-dica]").forEach(function (el) {
      var dica = texto((C[nome] || {}).dica);
      if (dica) el.textContent = dica;
    });

    // Quem já digitou a senha neste navegador não digita de novo.
    try {
      var salvo = localStorage.getItem(LEMBRAR_DOWNLOAD[nome]);
      if (salvo && /^https?:\/\//i.test(salvo)) {
        liberarDownload(salvo, nome, false);
        return;
      }
    } catch (e) {}

    var form = document.getElementById("form-portao");
    var campo = document.getElementById("senha-download");
    var botao = document.getElementById("botao-portao");
    var erro = document.getElementById("erro-portao");
    var tentando = false;

    if (!form || !campo || !botao || !erro) return;

    async function tentar() {
      if (tentando) return;

      var senha = campo.value.trim();

      if (!senha) { erro.textContent = "Digite a senha."; return; }

      if (!window.crypto || !crypto.subtle) {
        erro.textContent = "Este navegador não conseguiu conferir a senha. " +
                           "Abra o site pelo endereço https ou peça o link no WhatsApp.";
        return;
      }

      tentando = true;
      botao.disabled = true;
      botao.textContent = "Conferindo…";
      erro.textContent = "";

      try {
        var link = await decifrarLink(senha, nome);
        if (link) { liberarDownload(link, nome, true); return; }
        erro.textContent = "Senha incorreta.";
      } catch (e) {
        erro.textContent = "Senha incorreta.";
      }

      tentando = false;
      botao.disabled = false;
      botao.textContent = "Liberar o download";
      campo.select();
    }

    form.addEventListener("submit", function (ev) { ev.preventDefault(); tentar(); });
  }

  /*
     Botao de download sem link nenhum (instalador ainda nao publicado) nao
     pode ficar na tela fingindo que funciona: sai de cena e entra um
     recado com o WhatsApp.
  */

  function avisarSemDownload() {
    if (texto(C.download) || portaoAtivo("portao")) return;

    var daPagina = nomeDoPortaoDaPagina();

    // A pagina de teste tem o aviso dela, em [data-sem-portao].
    if (daPagina && daPagina !== "portao") return;

    botoesDeDownload(null).forEach(function (el) { el.classList.add("oculto"); });
    todos("[data-sem-download]").forEach(function (el) { el.classList.remove("oculto"); });
  }

  function preencherConferencia() {
    var sha = texto(C.sha256);
    if (!sha) return;

    todos("[data-sha]").forEach(function (el) { el.textContent = sha.toUpperCase(); });
    todos("[data-sha-bloco]").forEach(function (el) { el.classList.remove("oculto"); });
  }

  function preencherContatos() {
    var email = texto(C.email);
    todos("[data-email]").forEach(function (el) {
      if (!email) { el.closest("[data-some-sem-email]") ? el.closest("[data-some-sem-email]").classList.add("oculto") : el.classList.add("oculto"); return; }
      el.setAttribute("href", "mailto:" + email);
      if (el.hasAttribute("data-email-texto")) el.textContent = email;
    });

    var insta = texto(C.instagram).replace(/^@/, "");
    todos("[data-instagram]").forEach(function (el) {
      if (!insta) { el.classList.add("oculto"); return; }
      el.setAttribute("href", "https://instagram.com/" + insta);
      if (el.hasAttribute("data-instagram-texto")) el.textContent = "@" + insta;
    });

    var pix = texto(C.pix);
    todos("[data-pix]").forEach(function (el) {
      if (!pix) { el.classList.add("oculto"); return; }
      el.textContent = pix;
    });
    if (pix) {
      todos("[data-pix-bloco]").forEach(function (el) { el.classList.remove("oculto"); });
      todos("[data-pix-nome]").forEach(function (el) { el.textContent = texto(C.pixNome); });
    }
  }

  /* -------------------------------------- tarja de configuracao pendente */

  /*
     A tarja de pendencia e recado PARA VOCE, nao para o cliente. Por isso
     ela so aparece quando o site esta rodando na sua maquina (servidor
     local ou arquivo aberto direto). No site publicado ela nunca aparece,
     mesmo faltando campo - visitante nao tem nada a ver com isso.
  */

  function ePreviaLocal() {
    var h = String(location.hostname || "").toLowerCase();

    return h === "localhost" || h === "127.0.0.1" || h === "::1" ||
           h === "" || location.protocol === "file:";
  }

  function avisarConfiguracaoPendente() {
    if (!ePreviaLocal()) return;

    var faltando = [];

    if (!texto(C.whatsapp)) faltando.push("whatsapp");

    var nome = nomeDoPortaoDaPagina();

    // Com o portao ligado, o link mora cifrado em portao.link e o campo
    // `download` fica vazio de proposito.
    if (nome === "portaoTeste") {
      if (!portaoAtivo(nome)) {
        faltando.push("portaoTeste (senha e link da versao de teste)");
      }
    } else if (!texto(C.download) && !portaoAtivo("portao")) {
      faltando.push("download");
    }

    var recados = [];

    if (portaoAtivo("portao") && texto(C.download)) {
      recados.push(
        "o portao de senha esta ligado, mas `download` tambem esta preenchido - " +
        "esse link aparece no codigo-fonte e passa por cima da senha. Deixe `download` vazio."
      );
    }

    if (!faltando.length && !recados.length) return;

    var tarja = document.createElement("div");
    tarja.setAttribute("role", "status");
    tarja.style.cssText = [
      "background:#FFF7E3",
      "color:#7A4E00",
      "border-bottom:1px solid #F0D79B",
      "padding:12px 20px",
      "font:500 15px/1.5 var(--corpo)",
      "text-align:center"
    ].join(";");
    var partes = [];

    if (faltando.length) {
      partes.push(
        "<strong>Site ainda nao publicado.</strong> Falta preencher em " +
        "<code>js/config.js</code>: " + faltando.join(", ") + "."
      );
    }

    if (recados.length) {
      partes.push("<strong>Atencao:</strong> " + recados.join(" "));
    }

    partes.push("Esta tarja some sozinha quando estiver tudo certo.");

    tarja.innerHTML = partes.join(" ");

    document.body.insertBefore(tarja, document.body.firstChild);
  }

  /* ============================================================
     PAGINA DE COMPRA - montagem do pedido
     ============================================================ */

  // Mesmo alfabeto e mesmas correcoes de licenca/identificacao.py, para o
  // codigo ser conferido aqui antes de o cliente mandar mensagem.
  var ALFABETO = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  var TROCAS = { O: "0", I: "1", L: "1", U: "V" };
  var LETRAS = 16;

  function normalizarCodigo(bruto) {
    if (!bruto) return "";

    var limpo = String(bruto).toUpperCase().replace(/[^A-Z0-9]/g, "");

    if (limpo.indexOf("XG") === 0) limpo = limpo.slice(2);

    limpo = limpo.replace(/[OILU]/g, function (c) { return TROCAS[c]; });

    if (limpo.length !== LETRAS) return "";

    for (var i = 0; i < limpo.length; i++) {
      if (ALFABETO.indexOf(limpo[i]) < 0) return "";
    }

    return "XG-" + limpo.slice(0, 4) + "-" + limpo.slice(4, 8) +
           "-" + limpo.slice(8, 12) + "-" + limpo.slice(12, 16);
  }

  function montarPedido() {
    var form = document.getElementById("form-pedido");
    if (!form) return;

    var campoCodigo = document.getElementById("codigo");
    var estadoCodigo = document.getElementById("estado-codigo");
    var blocoModulos = document.getElementById("bloco-modulos");
    var resumo = document.getElementById("resumo-pedido");
    var previa = document.getElementById("previa-pedido");
    var botaoWa = document.getElementById("botao-whatsapp");
    var botaoCopiar = document.getElementById("botao-copiar");
    var linkEmail = document.getElementById("botao-email");
    var avisoFalta = document.getElementById("aviso-falta");

    // Os periodos de licenca/chave.py (PLANOS). O que a licenca libera
    // vem da lista de modulos, nao do periodo.
    var NOMES_DE_PLANO = {
      diaria: "Diária (24 horas)",
      mensal: "Mensal (30 dias)",
      anual: "Anual (12 meses)",
      vitalicia: "Vitalícia (não vence)",
    };

    function planoEscolhido() {
      var marcado = form.querySelector('input[name="plano"]:checked');
      return marcado ? marcado.value : "anual";
    }

    function querTudo() {
      var tudo = document.getElementById("mod-tudo");
      return !!(tudo && tudo.checked);
    }

    function modulosEscolhidos() {
      return todos('#bloco-modulos input[name="modulo"]:checked').map(function (el) {
        return { codigo: el.value, nome: el.getAttribute("data-nome") };
      });
    }

    function valor(id) {
      var el = document.getElementById(id);
      return el ? el.value.trim() : "";
    }

    function textoDoPedido(codigo) {
      var plano = planoEscolhido();

      var linhas = [
        "*Pedido de licença do XGuri*",
        "",
        "Nome / fazenda: " + (valor("nome") || "-"),
        "Cidade / UF: " + (valor("cidade") || "-"),
        "WhatsApp: " + (valor("fone") || "-"),
        "Código da máquina: " + codigo,
        "Período: " + (NOMES_DE_PLANO[plano] || plano),
      ];

      if (querTudo()) {
        linhas.push("Módulos: todos os pagos");
      } else {
        var lista = modulosEscolhidos();
        linhas.push("Módulos: " + (lista.length
          ? lista.map(function (m) { return m.nome; }).join(", ")
          : "(nenhum marcado)"));
      }

      if (valor("obs")) linhas.push("Observação: " + valor("obs"));

      linhas.push("");
      linhas.push("Pedido montado em " + window.location.host + (window.location.pathname || ""));

      return linhas.join("\n");
    }

    function faltando(codigo) {
      var pendencias = [];

      if (!valor("nome")) pendencias.push("seu nome ou o nome da fazenda");
      if (!codigo) pendencias.push("o código da máquina completo (XG-XXXX-XXXX-XXXX-XXXX)");
      if (!querTudo() && !modulosEscolhidos().length) {
        pendencias.push("pelo menos um módulo, ou “Tudo liberado”");
      }

      return pendencias;
    }

    function atualizar() {
      var bruto = campoCodigo.value;
      var codigo = normalizarCodigo(bruto);
      var digitado = bruto.replace(/[^A-Za-z0-9]/g, "").replace(/^XG/i, "");

      // situacao do codigo da maquina
      if (!bruto.trim()) {
        estadoCodigo.textContent = "";
        estadoCodigo.className = "estado";
        campoCodigo.removeAttribute("aria-invalid");
      } else if (codigo) {
        estadoCodigo.textContent = "Código válido: " + codigo;
        estadoCodigo.className = "estado estado--ok";
        campoCodigo.removeAttribute("aria-invalid");
      } else {
        estadoCodigo.textContent = digitado.length < 16
          ? "Faltam " + (16 - digitado.length) + " caractere(s): o código tem 16 letras e números."
          : "Esse código não confere. Confira letra por letra na tela do XGuri.";
        estadoCodigo.className = "estado estado--erro";
        campoCodigo.setAttribute("aria-invalid", "true");
      }

      // "Tudo liberado" manda: as escolhas soltas saem de cena.
      if (blocoModulos) blocoModulos.classList.remove("oculto");

      var listaSolta = document.getElementById("modulos-soltos");

      if (listaSolta) listaSolta.classList.toggle("oculto", querTudo());

      var pendencias = faltando(codigo);
      var mensagem = textoDoPedido(codigo || "(nao informado)");

      previa.textContent = mensagem;

      if (pendencias.length) {
        avisoFalta.textContent = "Para enviar, falta preencher: " + pendencias.join("; ") + ".";
        avisoFalta.classList.remove("oculto");
        resumo.classList.add("oculto");
      } else {
        avisoFalta.classList.add("oculto");
        resumo.classList.remove("oculto");
      }

      var link = whatsappLink(mensagem);

      if (link && !pendencias.length) {
        botaoWa.setAttribute("href", link);
        botaoWa.removeAttribute("aria-disabled");
      } else {
        botaoWa.setAttribute("href", "#");
        botaoWa.setAttribute("aria-disabled", "true");
      }

      if (linkEmail) {
        var email = texto(C.email);
        if (email) {
          linkEmail.setAttribute(
            "href",
            "mailto:" + email +
            "?subject=" + encodeURIComponent("Pedido de licença do XGuri") +
            "&body=" + encodeURIComponent(mensagem)
          );
        } else {
          linkEmail.classList.add("oculto");
        }
      }
    }

    form.addEventListener("input", atualizar);
    form.addEventListener("change", atualizar);

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      atualizar();
      if (botaoWa.getAttribute("aria-disabled") !== "true") {
        window.open(botaoWa.getAttribute("href"), "_blank", "noopener");
      }
    });

    botaoWa.addEventListener("click", function (ev) {
      if (botaoWa.getAttribute("aria-disabled") === "true") ev.preventDefault();
    });

    if (botaoCopiar) {
      botaoCopiar.addEventListener("click", function () {
        var texto_ = previa.textContent;
        var avisar = function (ok) {
          botaoCopiar.textContent = ok ? "Pedido copiado" : "Selecione o texto e copie";
          setTimeout(function () { botaoCopiar.textContent = "Copiar pedido"; }, 2600);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(texto_).then(function () { avisar(true); },
                                                     function () { avisar(false); });
        } else {
          avisar(false);
        }
      });
    }

    // Se o cliente chegou pela pagina de download com o plano na URL
    // (comprar.html?plano=vitalicia), ja vem marcado.
    var planoNaUrl = new URLSearchParams(window.location.search).get("plano");
    if (planoNaUrl) {
      var alvo = form.querySelector('input[name="plano"][value="' + planoNaUrl + '"]');
      if (alvo) alvo.checked = true;
    }

    atualizar();
  }

  /* ---------------------------------------------------------------- inicio */

  function iniciar() {
    preencherTextos();
    preencherDownloads();
    montarPortao();
    prepararBotoesTrancados();
    avisarSemDownload();
    // Por ultimo: no celular ele esconde o que o portao acabou de mostrar.
    avisarSeNaoForWindows();
    preencherConferencia();
    preencherWhatsapp();
    preencherContatos();
    montarPedido();
    avisarConfiguracaoPendente();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
