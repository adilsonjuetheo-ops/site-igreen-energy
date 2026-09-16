# iGreen Energy — Landing Page

Landing page de captação para o programa de desconto na conta de energia da **iGreen Energy**.
Site estático, sem build, sem dependências de framework.

🔗 **Online:** https://www.igreensol.com.br

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
├── privacidade.html    # Política de privacidade (LGPD)
├── css/styles.css      # Estilos, tokens de tema e responsividade
├── js/main.js          # Calculadora, FAQ, header, modal, envio e scroll reveal
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

### Produção — VPS com Coolify
`https://www.igreensol.com.br`, servido pelo container nginx, com certificado
Let's Encrypt emitido pelo Coolify. Todo push na `main` dispara redeploy via
webhook do GitHub.

### GitHub Pages
Espelho publicado a partir da branch `main`. As tags `canonical` apontam para o
domínio próprio, então o espelho não concorre com ele nos buscadores.

### VPS com Coolify
O projeto inclui `Dockerfile` baseado em `nginx:1.27-alpine`.

```bash
docker build -t igreen-energy .
docker run -p 8080:80 igreen-energy
```

No Coolify: criar uma aplicação do tipo **Dockerfile** apontando para este
repositório, porta exposta **80**, e apontar o domínio desejado.

## Fluxo de conversão

O botão **Cadastrar** do topo leva direto ao cadastro no site do parceiro, para
quem já chegou decidido. Os demais CTAs principais abrem o modal de cadastro em
vez de mandar o visitante direto para fora do site. Ao enviar o formulário, os dados (nome, telefone, distribuidora
e o valor simulado na calculadora) são montados numa mensagem e abertos no
WhatsApp do consultor — o lead é capturado antes de qualquer redirecionamento.

O `href` externo continua nos botões como fallback: se o JavaScript não carregar,
o visitante ainda chega ao site do parceiro.

Não há banco de dados: os dados existem apenas no navegador até o envio da mensagem.

- Consultor (leads): `https://wa.me/5533997315900`
- Cadastro parceiro (fallback sem JS): `https://green.igreenenergy.com.br/?id=168451`
- iGreen Club: `https://club.igreenenergy.com.br/?ref=82a1be9c-392d-4364-9ffb-b93e64669b71`
- Percentual de desconto: constante `DISCOUNT_RATE` no topo de `js/main.js`

## Dados cadastrais exibidos

| Registro | CNPJ | Papel |
|---|---|---|
| iGreen Energia Comércio e Serviço S.A. | 44.159.238/0001-30 | Empresa representada (matriz, Uberlândia/MG, desde 08/11/2021) |
| Consórcio iGreen Energy | 62.298.581/0001-47 | Geração de energia elétrica |

Aparecem no rodapé de `index.html` e na seção 1 de `privacidade.html`.

A política distingue os papéis de propósito: os dados do formulário vão para o
**consultor representante**, não para a iGreen. Quem trata o lead no primeiro
momento é o consultor, e é o contato dele que responde por pedidos da LGPD.

## Medição de audiência

Desligada por padrão. Para ativar, preencha o ID no topo de `js/main.js`:

```js
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
```

Com o campo vazio nenhum script de terceiro é carregado e nenhum cookie é
criado — é o estado que a política de privacidade declara hoje. **Ao ativar,
atualize a seção 5 de `privacidade.html` antes de publicar.**

Eventos já instrumentados:

| Evento | Quando dispara |
|---|---|
| `usou_calculadora` | Primeira digitação na calculadora (uma vez por visita) |
| `abriu_formulario` | Clique num CTA que abre o modal, com o id de origem |
| `gerou_lead` | Envio do formulário, com distribuidora e valor da conta |
| `clicou_whatsapp` | Clique direto em qualquer link `wa.me` |
| `clicou_club` | Saída para o iGreen Club, que é um funil separado |
| `clicou_cadastro_direto` | Saída direta ao cadastro sem passar pelo formulário |

## Cache de estáticos

`nginx.conf` serve `css/` e `js/` com `Cache-Control: immutable` por 30 dias. Por
isso as duas páginas HTML referenciam esses arquivos com um parâmetro de versão:

```html
<link rel="stylesheet" href="css/styles.css?v=2026091501">
<script src="js/main.js?v=2026091501"></script>
```

**Ao alterar qualquer coisa em `css/` ou `js/`, incremente esse `?v=` nas duas
páginas.** Sem isso, quem já visitou o site continua com a versão antiga em cache
e passa a ver HTML novo com CSS velho — o que quebra o layout em vez de apenas
deixá-lo desatualizado.

## Acessibilidade

- Modal com focus trap, retorno de foco ao elemento que o abriu e bloqueio da
  rolagem de fundo; fecha com `Esc` ou clique no fundo.
- Estados de foco visíveis em todos os elementos interativos (`:focus-visible`).
- Animações de entrada respeitam `prefers-reduced-motion`.
