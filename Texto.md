Para implementar o sistema de agendamento de consultas, precisamos garantir que o usuário possa marcar consultas, visualizar suas consultas existentes e verificar conflitos de horário. Abaixo está um esboço de como você pode implementar essa funcionalidade.

Primeiramente, você precisa de um modelo para representar os agendamentos no banco de dados. Vamos assumir que você está usando o Sequelize como ORM.

1. Criar o Modelo de Agendamento
Crie um novo arquivo models/appointment.js com o seguinte conteúdo:

/*
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Ajuste o caminho conforme necessário

const Agendamento = sequelize.define('Agendamento', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    specialty: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    }
});

module.exports = Agendamento;
*/

2. Atualizar app.js para incluir a lógica de agendamento
Adicione as rotas para lidar com a criação de novos agendamentos e a verificação de conflitos:

/*
// No topo do arquivo, após as outras importações
const Agendamento = require('./models/agendamento');

// Middleware para garantir autenticação
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/entrar');
    }
}

// Renderizar a página de agendamento com os agendamentos do usuário
app.get('/agendar', ensureAuthenticated, async (req, res) => {
    try {
        const appointments = await Appointment.findAll({
            where: { userId: req.user.id }
        });
        res.render('agendar', { appointments });
    } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
        res.status(500).send('Erro ao buscar agendamentos');
    }
});

// Endpoint para criar um novo agendamento
app.post('/agendar', ensureAuthenticated, async (req, res) => {
    const { specialty, date } = req.body;
    const userId = req.user.id;

    try {
        // Verificar se já existe um agendamento para o mesmo usuário na mesma data
        const existingAppointment = await Appointment.findOne({
            where: {
                userId: userId,
                date: date
            }
        });

        if (existingAppointment) {
            return res.status(400).send('Você já tem um agendamento nesta data e horário.');
        }

        // Criar o novo agendamento
        await Appointment.create({
            userId: userId,
            specialty: specialty,
            date: date
        });

        res.redirect('/agendar');
    } catch (error) {
        console.error('Erro ao criar agendamento:', error);
        res.status(500).send('Erro ao criar agendamento');
    }
});
*/


3. Atualizar a View agendar.handlebars
Atualize agendar.handlebars para exibir os agendamentos existentes e permitir a criação de novos agendamentos:

/*
<head>
    <title>Agende sua consulta</title>
    <link rel="icon" href="/img/VitaMed.png">
    <link rel="stylesheet" href="/css/agendar.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
</head>

<nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
        <a href="/cliente"><img src="/img/VitaMed.svg" width="150px" height="150px" alt=""></a>
        <a class="navbar-brand" href="#">Agendando sua consulta!</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav">
                <li class="nav-item">
                    <a class="nav-link active" aria-current="page" href="/cliente">Página Inicial</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/perfil">Acessar perfil</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/alterar">Alterar Dados</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/">Sair</a>
                </li>
            </ul>
        </div>
    </div>
</nav>

<div class="container-forms p-5">
    <form action="/agendar" method="POST">
        <div class="mb-3">
            <label for="Especialidade" class="form-label">Selecione a Especialidade</label>
            <input class="form-control" list="especialidade" type="text" placeholder="Escolha uma Especialidade" id="Esp" name="especialidade">
            <datalist id="especialidade">
                <option value="Oftalmologia"></option>
                <option value="Ortopedia"></option>
                <option value="Clinico Geral"></option>
                <option value="Neurologia"></option>
                <option value="Otorrino"></option>
                <option value="Ginecologia"></option>
            </datalist>
        </div>


        <div class="mb-3">
            <label for="Date" class="form-label">Escolha uma data</label>
            <input type="datetime-local" id="Data" class="form-control" name="date">
        </div>
    
        <div class="d-grid gap-2">
            <button type="submit" class="btn btn-primary custom-btn">Agendar consulta</button>
        </div>
        <div class="form-text">Verifique antes de confirmar sua consulta. 😉</div>
    </form>
</div>

<div class="container p-5">
    <h3>Consultas Agendadas</h3>
    {{#if appointments.length}}
        <ul class="list-group">
            {{#each appointments}}
                <li class="list-group-item">
                    Especialidade: {{this.specialty}}<br>
                    Data: {{this.date}}
                </li>
            {{/each}}
        </ul>
    {{else}}
        <p>Você não possui consultas agendadas.</p>
    {{/if}}
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
*/


4. Sincronizar os Modelos com o Banco de Dados
Garanta que o modelo Agendamento seja sincronizado com o banco de dados. Adicione o código abaixo em seu arquivo principal (geralmente onde você configura o Sequelize):

/*
const banco = require('./banco'); // Ajuste o caminho conforme necessário
const Agendamento = require('./models/agendamento');

banco.sync({ force: false })
    .then(() => {
        console.log('Tabelas sincronizadas');
    })
    .catch((error) => {
        console.error('Erro ao sincronizar tabelas:', error);
    });
*/


Com essas alterações, seu sistema de agendamento deve estar funcional, permitindo aos usuários agendar consultas e visualizar suas consultas existentes. Certifique-se de tratar corretamente a autenticação e autorização para garantir a segurança dos dados dos usuários.



Para integrar a visualização das consultas agendadas na página de perfil e garantir que os usuários vejam suas consultas de forma dinâmica, precisamos ajustar a renderização da página de perfil para incluir os dados de agendamento do usuário.

1. Atualizar a Rota do Perfil
No arquivo app.js, ajuste a rota /perfil para buscar e passar as consultas do usuário para a view:

/*
const Agendamento = require('./models/agendamento'); // Adicione a importação do modelo de Agendamento

// Rota do perfil do usuário
app.get('/perfil', ensureAuthenticated, async function (req, res) {
    try {
        const user = await post.findOne({ where: { email: req.user.email } });

        // Buscar as consultas do usuário
        const agendamentos = await agendamento.findAll({
            where: { userId: req.user.id }
        });

        res.render('perfil', {
            user: user ? user.dataValues : {},
            agendamentos: agendamentos.map(app => app.dataValues) // Passar os dados das consultas para a view
        });
    } catch (error) {
        console.error('Erro ao buscar dados do usuário ou consultas:', error);
        res.status(500).send('Erro ao buscar dados do usuário ou consultas');
    }
});
*/


2. Atualizar a View perfil.handlebars
Atualize a view perfil.handlebars para exibir dinamicamente as consultas do usuário:

/*
<head>
    <title>Perfil | VITAMED</title>
    <link rel="stylesheet" href="/css/perfil.css">
    <link rel="stylesheet" href="/css/main.css">
    <link rel="icon" href="/img/VitaMed.png">
</head>
<header>
    <a href="/cliente" class="logo"><img src="/img/VitaMed.svg" alt="Logo VitaMed" width="15%"></a>
    <nav>
        <a href="/cliente">PÁGINA INICIAL</a>
        <a href="/alterar">ALTERAR PERFIL</a>
    </nav>
    <a href="/agendar" id="entrar"><button>AGENDAR CONSULTA</button></a>
</header>
<div class="container-pai">
    <div class="container">
        <div class="wellcome">
            <h1>Bem Vindo ao seu perfil!</h1>
            <div class="dados">
                <p>Paciente: {{user.nome}}</p>
                <p>Tel: {{user.telefone}}</p>
            </div>
            <div class="itens">
                <div class="hist-consu">
                    <h3>Histórico de Consulta</h3>
                    <div class="espaco"></div>
                    <div class="consultas">
                        {{#if agendamentos.length}}
                            {{#each agendamentos}}
                                <div class="consulta1">
                                    <a href="#">{{this.especialidade}} - {{this.data}}</a>
                                </div>
                            {{/each}}
                        {{else}}
                            <p>Você não possui consultas agendadas.</p>
                        {{/if}}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
*/


3. Sincronizar os Modelos com o Banco de Dados
Garanta que o modelo Appointment esteja sincronizado com o banco de dados, conforme mencionado anteriormente:

/*
const banco = require('./banco'); // Ajuste o caminho conforme necessário
const Agendamento = require('./models/agendamento');

banco.sync({ force: false })
    .then(() => {
        console.log('Tabelas sincronizadas');
    })
    .catch((error) => {
        console.error('Erro ao sincronizar tabelas:', error);
    });
*/


4. Incluir Log de Erro
Certifique-se de ter um log de erros para facilitar a depuração. Se houver algum erro ao renderizar a página de perfil ou ao buscar os dados, ele será registrado no console.

Conclusão
Com essas mudanças, seu sistema estará configurado para permitir que os usuários agendem consultas e visualizem suas consultas agendadas em seu perfil. Esta configuração garante que os dados sejam dinâmicos e reflitam o estado atual das consultas do usuário. Se houver problemas de autenticação ou autorização, eles serão tratados de maneira adequada para garantir a segurança dos dados dos usuários.