# Site do XGuri

Site estático para distribuir o programa e receber os pedidos de licença.
Não tem servidor, não tem banco de dados e não guarda dados de ninguém: o
pedido sai pelo WhatsApp do próprio cliente, já escrito e com o código da
máquina conferido.

**A chave privada das licenças não entra aqui.** Ela continua só na sua
máquina, em `chaves_licenca/chave_privada.txt` do projeto do XGuri. Quem
emite as licenças é você, com `ferramentas/gerar_licenca.py`, como sempre.

## Arquivos

```
index.html        pagina principal (programa, modulos, licenca, planos, FAQ)
download.html     download, requisitos, instalacao e como ativar
comprar.html      monta o pedido e abre o WhatsApp com ele pronto
manual.html       manual do XGuri (copia de manual_xguri.html)
Manual_XGuri.pdf  o mesmo manual em PDF, para baixar
css/estilo.css    todo o visual
js/config.js      <-- O UNICO ARQUIVO QUE VOCE EDITA NO DIA A DIA
js/site.js        comportamento das paginas e conferencia do codigo da maquina
assets/           logotipo, icone e a foto de abertura
.nojekyll         impede o GitHub Pages de processar os arquivos
```

## 1. Preencher a configuração

Abra `js/config.js` e preencha:

| Campo        | O que é                                                    |
| ------------ | ---------------------------------------------------------- |
| `whatsapp`   | **obrigatório** — só números, com 55 e DDD: `5555999998888` |
| `download`   | **obrigatório** — link do instalador no GitHub Releases     |
| `versao`     | versão que está no ar                                       |
| `lancamento` | data em que você publicou                                   |
| `tamanho`    | tamanho do instalador, como o cliente lê                    |
| `sha256`     | opcional, para o cliente conferir o arquivo                 |
| `email`      | opcional — vazio esconde o e-mail do site                    |
| `instagram`  | opcional, sem o @                                           |
| `pix`        | opcional — vazio esconde o bloco de pagamento                |
| `precos`     | escreva como quer que apareça: `"R$ 1.800"`                 |

Enquanto `whatsapp` ou `download` estiverem vazios, aparece uma tarja
amarela no topo do site avisando o que falta. Ela some sozinha quando os
dois estiverem preenchidos.

Para ver o site antes de publicar, é só abrir `index.html` no navegador.

## 2. Criar o repositório público

O repositório do XGuri é **privado**, e o GitHub Pages não publica site de
repositório privado — nem deixa baixar arquivo de Release privado. Por isso o
site mora num repositório separado e público. Só o site e o instalador ficam
lá; o código-fonte do programa continua privado.

```bash
cd "D:/Area de trabalho/xguri-site"
git init -b main
git add .
git commit -m "Site do XGuri"
gh repo create xguri-site --public --source . --remote origin --push
```

## 3. Subir o instalador no Releases

O instalador tem cerca de 480 MB. Ele **não** pode ser versionado no Git
(o limite de arquivo do GitHub é 100 MB) — ele vai como anexo de Release,
onde o limite é 2 GB e o download passa pelo CDN do GitHub.

Gere o instalador no projeto do XGuri (`CRIAR_INSTALADOR.bat`) e depois:

```bash
gh release create v1.0.0 "D:/Area de trabalho/xguri/installer_output/XGuri_Setup_1.0.0.exe" \
  --repo SEU-USUARIO/xguri-site \
  --title "XGuri 1.0.0" \
  --notes "Primeira versão publicada."
```

O link que vai em `js/config.js` fica assim:

```
https://github.com/SEU-USUARIO/xguri-site/releases/download/v1.0.0/XGuri_Setup_1.0.0.exe
```

Confira o link num navegador antes de divulgar.

## 4. Ligar o GitHub Pages

```bash
gh api -X POST repos/SEU-USUARIO/xguri-site/pages \
  -f "source[branch]=main" -f "source[path]=/"
```

Ou pelo site: **Settings › Pages › Source: Deploy from a branch › main / (root)**.

Em poucos minutos o site fica no ar em
`https://SEU-USUARIO.github.io/xguri-site/`.

## 5. Domínio próprio (opcional)

Se você registrar um domínio (por exemplo `guridosdrones.com.br`):

1. Crie um arquivo chamado `CNAME` nesta pasta, com uma linha só: o domínio.
2. No painel do seu registrador, aponte os registros do domínio para o
   GitHub Pages (`A` para 185.199.108.153, 185.199.109.153, 185.199.110.153
   e 185.199.111.153; ou `CNAME` de `www` para `SEU-USUARIO.github.io`).
3. Em **Settings › Pages**, escreva o domínio em *Custom domain* e marque
   *Enforce HTTPS*.

## 6. Publicar uma versão nova do XGuri

```bash
# 1. gerar o instalador no projeto do XGuri
# 2. subir como Release novo
gh release create v1.1.0 "D:/Area de trabalho/xguri/installer_output/XGuri_Setup_1.1.0.exe" \
  --repo SEU-USUARIO/xguri-site --title "XGuri 1.1.0" --notes "O que mudou."

# 3. atualizar versao, lancamento, download e sha256 em js/config.js
# 4. publicar o site
git add js/config.js
git commit -m "XGuri 1.1.0 no ar"
git push
```

O script `publicar_versao.ps1` faz os passos 2 e 3 de uma vez.

## O que nunca entra neste repositório

- `chaves_licenca/` — a chave privada das licenças. Se ela vazar, qualquer
  pessoa emite licença vitalícia do XGuri para sempre.
- `licencas_emitidas/` — os `.lic` dos clientes têm nome de cliente dentro.
- O código-fonte do XGuri. Aqui só ficam o site e o instalador pronto.
