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
teste.html        pagina de avaliacao de 3 dias (link privado, com senha)
manual.html       manual do XGuri (copia de manual_xguri.html)
Manual_XGuri.pdf  o mesmo manual em PDF, para baixar
css/estilo.css    todo o visual
js/config.js      <-- O UNICO ARQUIVO QUE VOCE EDITA NO DIA A DIA
js/site.js        comportamento das paginas e conferencia do codigo da maquina
assets/           logotipo, icone e a foto de abertura
treinamento/      area de treinamento (simulador e quiz), com senha propria
.nojekyll         impede o GitHub Pages de processar os arquivos

_ferramenta-senha.html   ferramenta LOCAL de senhas (esta no .gitignore,
                         nao vai para o site): gera a senha do treinamento
                         e a senha do download
```

## 1. Preencher a configuração

Abra `js/config.js` e preencha:

| Campo        | O que é                                                    |
| ------------ | ---------------------------------------------------------- |
| `whatsapp`   | **obrigatório** — só números, com 55 e DDD: `5555999998888` |
| `download`   | link do instalador no GitHub Releases. Com o portão de senha ligado, deixe **vazio** |
| `versao`     | versão que está no ar                                       |
| `lancamento` | data em que você publicou                                   |
| `tamanho`    | tamanho do instalador, como o cliente lê                    |
| `sha256`     | opcional, para o cliente conferir o arquivo                 |
| `email`      | opcional — vazio esconde o e-mail do site                    |
| `instagram`  | opcional, sem o @                                           |
| `pix`        | opcional — vazio esconde o bloco de pagamento                |
| `precos`     | um valor por período (`diaria`, `mensal`, `anual`, `vitalicia`): `"R$ 1.800"`. `null` = "Sob consulta" |
| `horasAvaliacao` | horas com tudo liberado na primeira abertura. Igual ao `HORAS_DE_AVALIACAO` de `licenca/edicao.py` |
| `portao`     | senha do download — gerado pela ferramenta, veja o passo 3.1 |

Enquanto faltar o `whatsapp`, ou faltar como o cliente baixa (`download`
preenchido **ou** o portão de senha configurado), aparece uma tarja amarela no
topo do site avisando o que falta. Ela some sozinha quando estiver tudo certo —
e também avisa se o portão estiver ligado com o `download` preenchido, porque aí
o link vaza no código-fonte e passa por cima da senha.

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

## 3.1 Senha no download (opcional)

A página de download pode ficar atrás de uma senha. O jeito que está feito:
a senha **decifra** o link do instalador, então nem a senha nem o endereço do
arquivo aparecem no código-fonte do site — só um embaralhado.

1. Suba o instalador no Releases (passo 3) e copie o link.
2. Ligue o servidor local e abra
   `http://localhost:8765/_ferramenta-senha.html` (em duplo clique o
   navegador bloqueia as funções de senha).
3. Na seção **Senha do download**, digite a senha e cole o link.
   A ferramenta confere sozinha se o link volta igual e mostra o bloco.
4. Cole o bloco no lugar do `portao: { ... }` de `js/config.js` e deixe o
   campo `download` **vazio**.

```bash
python -m http.server 8765
```

Trocar a senha depois é repetir os passos 2 a 4. Quem já digitou continua
entrando sem digitar naquele navegador; para expulsar todo mundo, troque
`xguri_download_v1` por `xguri_download_v2` em `js/site.js`.

**O que essa senha faz e o que não faz.** Ela filtra curioso: quem cai no
site não baixa sem pedir a senha. Ela não é cofre — o instalador continua
sendo um arquivo público no GitHub Releases, e quem procurar a aba Releases
do repositório baixa sem senha, do mesmo jeito que quem tem a senha pode
repassar o link no grupo do WhatsApp. Quem protege o XGuri é a licença: sem
`.lic`, depois de 15 dias o programa não abre.

Duas medidas baratas que ajudam:

- Suba o instalador num **repositório separado**, com nome sem graça
  (`xguri-arquivos`), diferente do repositório do site. O endereço do site
  (`usuario.github.io/xguri-site`) entrega o nome do repositório do site,
  não o do arquivo.
- Site estático não registra quem baixou. Se algum dia você quiser essa
  lista, aí precisa de um pedacinho no servidor (Google Apps Script grátis
  resolve, gravando numa planilha).

## 3.2 Pagina de teste (teste.html)

Pagina separada, que voce manda para quem pediu para avaliar. Nao esta no
menu de nenhuma outra pagina e leva `noindex`: quem nao recebeu o link nao
chega nela.

Ela entrega o **XGuri_Teste_3dias**, que e outro arquivo: abre completo por
3 dias e depois se remove do computador do avaliador (o como esta no
`LEIA-ME.txt` do projeto do XGuri, secao "VERSAO DE TESTE").

Senha e link sao **separados** do download geral, de proposito: se
dividissem o mesmo bloco, voce mandaria a versao definitiva a quem pediu
so uma avaliacao. Enquanto `portaoTeste` estiver desligado, a pagina nao
mostra link nenhum - nem cai no campo `download`.

Para liberar:

1. Monte o instalador de teste (`CRIAR_INSTALADOR_TESTE.bat` no projeto do
   XGuri).
2. Suba no Releases, como qualquer outra versao:

```bash
gh release create v1.0.0-teste "D:/Area de trabalho/xguri/installer_output/XGuri_Teste_3dias_1.0.0.exe" --repo SEU-USUARIO/xguri-arquivos --title "XGuri 1.0.0 - teste de 3 dias" --notes "Versao de avaliacao: 3 dias, com autorremocao."
```

3. Em `_ferramenta-senha.html`, escolha **Pagina de teste** no seletor,
   digite a senha do avaliador e cole o link.
4. Cole o bloco no lugar do `portaoTeste: { ... }` de `js/config.js`.
5. Mande para a pessoa o link da pagina e a senha:
   `https://SEU-USUARIO.github.io/xguri-site/teste.html`

Dica de uso: trocar a senha a cada turma ou a cada cliente (por exemplo
`teste-outubro`) deixa voce fechar a torneira depois, sem mexer no resto do
site.

## 3.3 Os textos e o programa andam juntos

Os textos do site descrevem o modelo comercial que esta no codigo. Se o
programa mudar, estes pontos do site mudam tambem:

| No programa | No site |
| --- | --- |
| `HORAS_DE_AVALIACAO` (`licenca/edicao.py`) | `horasAvaliacao` no config |
| `RECURSOS` e `RECURSOS_GRATUITOS` (`licenca/chave.py`) | secao "Gratis e pago" da index e os modulos do formulario em `comprar.html` |
| `PLANOS` (`licenca/chave.py`) | `precos` no config, secao de planos da index e o campo "Por quanto tempo" |
| Processamento Online (`paginas/processamento_online.py`) | o cartao "Servidor, so se voce quiser" e a pergunta sobre nuvem |

Em 16/09/2026 o site foi acertado para: gratuito permanente (processar as
fotos + mapa de aplicacao), 24 horas com tudo liberado na primeira
abertura, 6 modulos pagos e 4 periodos.

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
