# ============================================================================
#  XGuri - publicar uma versao nova do instalador
#
#  O que faz:
#    1. confere se o instalador existe;
#    2. calcula o SHA-256 do arquivo;
#    3. cria o Release no repositorio publico do site e anexa o instalador;
#    4. atualiza versao, lancamento, tamanho, download e sha256 em js/config.js.
#
#  Depois disso, sobra so dar o commit e o push do site.
#
#  Uso (no PowerShell, dentro da pasta do site):
#
#      .\publicar_versao.ps1 -Versao 1.1.0 -Repositorio SEU-USUARIO/xguri-site
#
#  Precisa do GitHub CLI instalado e logado (gh auth login).
# ============================================================================

param(
  [Parameter(Mandatory = $true)] [string] $Versao,
  [Parameter(Mandatory = $true)] [string] $Repositorio,
  [string] $Instalador = "",
  [string] $Notas = ""
)

$ErrorActionPreference = "Stop"

if (-not $Instalador) {
  $Instalador = "D:\Area de trabalho\xguri\installer_output\XGuri_Setup_$Versao.exe"
}

if (-not (Test-Path $Instalador)) {
  Write-Host "Instalador nao encontrado:" -ForegroundColor Red
  Write-Host "  $Instalador"
  Write-Host ""
  Write-Host "Gere o instalador primeiro (CRIAR_INSTALADOR.bat no projeto do XGuri),"
  Write-Host "ou passe o caminho em -Instalador."
  exit 1
}

$arquivo = Get-Item $Instalador
$tamanhoMB = [math]::Round($arquivo.Length / 1MB)
$tamanho = "$tamanhoMB MB"

Write-Host "Instalador: $($arquivo.Name)  ($tamanho)"
Write-Host "Calculando SHA-256..."
$sha = (Get-FileHash $Instalador -Algorithm SHA256).Hash.ToLower()
Write-Host "  $sha"

if (-not $Notas) { $Notas = "XGuri $Versao" }

Write-Host ""
Write-Host "Criando o Release v$Versao em $Repositorio (o upload demora)..."

gh release create "v$Versao" $Instalador --repo $Repositorio --title "XGuri $Versao" --notes $Notas
if ($LASTEXITCODE -ne 0) {
  Write-Host "O gh release falhou. O site nao foi alterado." -ForegroundColor Red
  exit 1
}

$link = "https://github.com/$Repositorio/releases/download/v$Versao/$($arquivo.Name)"
$hoje = (Get-Date).ToString("yyyy-MM-dd")

# --- atualiza js/config.js ---------------------------------------------------

$config = Join-Path $PSScriptRoot "js\config.js"
$texto = Get-Content $config -Raw -Encoding UTF8

$texto = [regex]::Replace($texto, 'versao:\s*".*?"',     "versao: `"$Versao`"")
$texto = [regex]::Replace($texto, 'lancamento:\s*".*?"', "lancamento: `"$hoje`"")
$texto = [regex]::Replace($texto, 'tamanho:\s*".*?"',    "tamanho: `"$tamanho`"")
$texto = [regex]::Replace($texto, 'download:\s*".*?"',   "download: `"$link`"")
$texto = [regex]::Replace($texto, 'sha256:\s*".*?"',     "sha256: `"$sha`"")

Set-Content $config -Value $texto -Encoding UTF8 -NoNewline

Write-Host ""
Write-Host "Release publicado e js/config.js atualizado." -ForegroundColor Green
Write-Host "  Link do download: $link"
Write-Host ""
Write-Host "Falta so publicar o site:"
Write-Host "  git add js/config.js"
Write-Host "  git commit -m `"XGuri $Versao no ar`""
Write-Host "  git push"
