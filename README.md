# iGreen Energy — Landing Page

Landing page de captação para o programa de desconto na conta de energia da **iGreen Energy**.
Site estático, sem build, sem dependências de framework.

🔗 **Online:** https://adilsonjuetheo-ops.github.io/site-igreen-energy/

---

## Sobre

Página única (one-page) com proposta de economia de até 15% na conta de luz sem
instalação de placas solares. Inclui calculadora de economia interativa, FAQ em
accordion, depoimentos, modal de cadastro e integração com WhatsApp.

## Seções

| Seção | Descrição |
|---|---|
| Header | Navegação fixa com efeito no scroll e CTA de cadastro |
| Hero | Ilustração SVG de painéis solares, título e CTAs principais |
| Benefícios | Faixa com os 7 diferenciais do serviço |
| Como funciona | Os 3 passos do processo de adesão |
| Calculadora | Simulador de economia mensal e anual (15% de desconto) |
| Garantia | Bloco de segurança e confiança |
| Vantagens | Cards com os diferenciais, incluindo o iGreen Club |
| Estatísticas | Faixa com números e resultados |
| Depoimentos | Provas sociais de clientes |
| FAQ | Perguntas frequentes em accordion |
| CTA final | Chamada de conversão com botões de ação |
| Rodapé | Contatos e suporte via WhatsApp |
| Flutuantes | Botão de WhatsApp, modal de cadastro e toast de confirmação |

## Estrutura

```
.
├── index.html          # Marcação completa da página
├── css/styles.css      # Estilos, tokens de tema e responsividade
├── js/main.js          # Calculadora, FAQ, header, modal e toast
├── assets/favicon.svg  # Ícone do site
├── Dockerfile          # Imagem nginx para deploy na VPS
├── nginx.conf          # Config do servidor (gzip, cache, headers)
├── robots.txt
└── sitemap.xml
```

## Identidade visual

Tema escuro em azul-petróleo com acentos em verde.

| Token | Cor | Uso |
|---|---|---|
| `--brand-primary` | `#0B6E4F` | Verde-esmeralda, identidade |
| `--brand-accent` | `#22C55E` | Verde-lima, CTAs primários |
| `--brand-light-green` | `#34D399` | Ícones e textos em fundo escuro |
| `--bg-dark-base` | `#0F3D4C` | Fundo principal |
| `--bg-dark-deep` | `#0B2C39` | Header e rodapé |
| `--gold` | `#D97706` | Botão de destaque no CTA final |

Tipografia: **Plus Jakarta Sans** (Google Fonts).

## Rodar localmente

Qualquer servidor estático serve. Por exemplo:

```bash
python -m http.server 8080
# depois abra http://localhost:8080
```

## Deploy

### GitHub Pages
Publicado automaticamente a partir da branch `main` (raiz do repositório).

### VPS com Coolify
O projeto inclui `Dockerfile` baseado em `nginx:1.27-alpine`.

```bash
docker build -t igreen-energy .
docker run -p 8080:80 igreen-energy
```

No Coolify: criar uma aplicação do tipo **Dockerfile** apontando para este
repositório, porta exposta **80**, e apontar o domínio desejado.

## Links de conversão

- Cadastro: `https://green.igreenenergy.com.br/?id=168451`
- WhatsApp: `https://wa.me/5533997315900`
