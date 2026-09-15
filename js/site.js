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

  function preencherDownloads() {
    var link = texto(C.download);

    todos("[data-download]").forEach(function (el) {
      if (link) {
        el.setAttribute("href", link);
        el.removeAttribute("aria-disabled");
        return;
      }
      el.setAttribute("href", "#");
      el.setAttribute("aria-disabled", "true");
      el.addEventListener("click", function (ev) {
        ev.preventDefault();
      });
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

  function avisarConfiguracaoPendente() {
    var faltando = [];

    if (!texto(C.whatsapp)) faltando.push("whatsapp");
    if (!texto(C.download)) faltando.push("download");

    if (!faltando.length) return;

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
    tarja.innerHTML =
      "<strong>Site ainda nao publicado.</strong> Falta preencher em " +
      "<code>js/config.js</code>: " + faltando.join(", ") +
      ". Esta tarja some sozinha quando os campos estiverem preenchidos.";

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

    var NOMES_DE_PLANO = {
      assinatura: "Assinatura de 1 ano – todos os módulos",
      vitalicia: "Licença vitalícia – todos os módulos",
      modulos: "Módulos avulsos, 1 ano",
    };

    function planoEscolhido() {
      var marcado = form.querySelector('input[name="plano"]:checked');
      return marcado ? marcado.value : "assinatura";
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
        "Plano: " + NOMES_DE_PLANO[plano],
      ];

      if (plano === "modulos") {
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
      if (planoEscolhido() === "modulos" && !modulosEscolhidos().length) {
        pendencias.push("pelo menos um módulo");
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

      // modulos so aparecem no plano de modulos avulsos
      blocoModulos.classList.toggle("oculto", planoEscolhido() !== "modulos");

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
