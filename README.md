# Projeto PI - VitaMed

Sistema web para agendamento de consultas e gestão básica de usuários, com autenticação, área de perfil e fluxo de recuperação de senha por e-mail.

## Objetivo

O projeto foi desenvolvido para prática de desenvolvimento full-stack no contexto acadêmico, com foco em:

- backend com Node.js e Express
- persistência com MySQL + Sequelize
- templates server-side com Handlebars
- deploy em ambiente serverless (Vercel)

## Tecnologias

- Node.js
- Express
- Express Handlebars
- Sequelize
- MySQL (`mysql2`)
- Passport (autenticação local)
- Express Session
- Nodemailer (Mailtrap)
- Bootstrap + CSS

## Funcionalidades

- Cadastro e login de usuário
- Autenticação de sessão
- Área de perfil
- Agendamento de consultas
- Alteração de dados de conta
- Recuperação de senha por token

---

## Como rodar localmente

### 1) Pré-requisitos

- Node.js 18+ (recomendado)
- NPM 9+
- MySQL local (XAMPP, WAMP ou serviço dedicado)

### 2) Clonar repositório

```bash
git clone https://github.com/Josec690/Projeto_PI-Vitamed.git
cd Projeto_PI-Vitamed
```

### 3) Instalar dependências

```bash
npm install
```

### 4) Configurar variáveis de ambiente

Crie/edite o arquivo `.env` na raiz do projeto com os valores abaixo:

```env
# Ambiente
NODE_ENV=development
APP_URL=http://localhost:8081

# Sessão
SECRET_KEY=troque-por-uma-chave-forte

# Banco de dados MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=projeto
DB_USERNAME=root
DB_PASSWORD=

# E-mail (Mailtrap)
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=seu-mailtrap-user
MAILTRAP_PASS=seu-mailtrap-pass

# Opcional: URL única de conexão
# DATABASE_URL=mysql://usuario:senha@host:porta/banco

# Opcional: SSL para provedores cloud
# DB_SSL=true
```

### 5) Criar banco de dados

No MySQL, crie o banco definido em `DB_NAME` (ex.: `projeto`).

```sql
CREATE DATABASE projeto;
```

### 6) Iniciar aplicação

```bash
npm start
```

Aplicação local: `http://localhost:8081`


---

## Estrutura principal

```text
app.js                # inicialização da aplicação e rotas
config.js             # configuração de ambiente para DB
models/               # modelos Sequelize
routes/               # rotas auxiliares
views/                # templates Handlebars
public/               # css, js e imagens estáticas
vercel.json           # configuração de deploy na Vercel
```

---

## Contribuição

Contribuições são bem-vindas.

### Fluxo recomendado

1. Faça um fork ou crie uma branch a partir da `main`.
2. Nomeie a branch de forma clara (`feat/...`, `fix/...`, `chore/...`).
3. Aplique mudanças pequenas e objetivas.
4. Teste localmente antes de enviar.
5. Abra um Pull Request com descrição do problema e da solução.

### Boas práticas para contribuir

- Não subir `.env` nem credenciais
- Manter compatibilidade com Node/Express atuais do projeto
- Evitar mudanças grandes sem necessidade
- Informar no PR qualquer variável nova de ambiente

### Comandos úteis

```bash
# instalar dependências
npm install

# rodar projeto
npm start
```

---

## Equipe do Projeto

- Gustavo M.
- João M.
- José C.
- Mateus S.
- Miguel G.

## Licença

Este projeto está licenciado sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.
