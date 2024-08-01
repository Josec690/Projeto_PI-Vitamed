require('dotenv').config()
const express = require('express')
const app = express()
const handlebars = require('express-handlebars').engine
const bodyParser = require('body-parser')
const nodemailer = require('nodemailer')
const bcrypt = require('bcryptjs')
const { Op } = require('sequelize')
const { v4: uuidv4 } = require('uuid')
const session = require('express-session')
const passport = require('./passportConfig')
const Post = require('./models/post')
const Postmr = require('./models/postmr')
const Agendamento = require("./models/agendamento")
const port = process.env.PORT || 8081

const banco = require('./models/banco')

banco.sequelize.sync({ force: false })
    .then(() => {
        console.log('Tabelas sincronizadas');
    })
    .catch((error) => {
        console.error('Erro ao sincronizar tabelas:', error);
    });

app.engine('handlebars', handlebars({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

app.use('/agendamentos', require('./routes/agendamentos'))
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(session({
    secret: process.env.SECRET_KEY, // substitua por uma chave secreta segura
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // use secure: true se estiver usando HTTPS
}))
app.use(passport.initialize())
app.use(passport.session())

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
    }
})

// Funções de recuperação de senha
app.get('/recuperar', (req, res) => {
    res.render('recuperar')
})
// Endpoint para solicitar recuperação de senha
app.post('/recuperar', async (req, res) => {
    const { email } = req.body

    try {
        const user = await Post.findOne({ where: { email: email } })
        if (!user) {
            return res.status(400).send('Email não encontrado')
        }

        const token = uuidv4()

        // Salve o código de recuperação no banco de dados ou na sessão
        user.resetToken = token
        user.tokenExpires = Date.now() + 3600000 // 1 hora
        await user.save()

        await sendPasswordResetEmail(email, token)

        res.send('Email de recuperação enviado com sucesso')
    } catch (error) {
        console.error('Erro ao solicitar recuperação de senha:', error)
        res.status(500).send('Erro ao solicitar recuperação de senha')
    }
})

async function sendPasswordResetEmail(email, token) {
    const resetUrl = `http://localhost:8081/verificar?token=${token}&email=${email}`

    // Envie o código de recuperação por email
    const mailOptions = {
        from: 'no-reply@example.com',
        to: email,
        subject: 'Password Reset',
        html: `<p>You requested a password reset</p>
               <p>Click this <a href="${resetUrl}">link</a> to reset your password</p>`
    }
    try {
        await transporter.sendMail(mailOptions)
        console.log('Password reset email sent successfully')
    } catch (error) {
        console.error('Error sending password reset email:', error)
        throw new Error('Error sending password reset email')
    }
}

app.get('/verificar', (req, res) => {
    const { email, token } = req.query
    res.render('verificar', { email, token })
})

app.post('/verificar', async (req, res) => {
    const { email, token } = req.body

    try {
        const user = await Post.findOne({ where: { email: email, resetToken: token, tokenExpires: { [Op.gt]: Date.now() } } })
        if (!user) {
            return res.status(400).send('Token inválido ou expirado')
        }

        // Redirecione para a tela de redefinição de senha
        res.redirect(`/novasenha?email=${email}&token=${token}`)
    } catch (error) {
        console.error('Erro ao verificar código de recuperação:', error)
        res.status(500).send('Erro ao verificar código de recuperação')
    }
})

app.get('/novasenha', (req, res) => {
    const { email, token } = req.query
    res.render('novasenha', { email, token })
})

// Endpoint para redefinir a senha
app.post('/novasenha', async (req, res) => {
    const { email, token, novaSenha, confirmarSenha } = req.body

    if (novaSenha !== confirmarSenha) {
        return res.status(400).send('As senhas não coincidem')
    }

    try {
        const user = await Post.findOne({ where: { email: email, resetToken: token, tokenExpires: { [Op.gt]: Date.now() } } })
        if (!user) {
            return res.status(400).send('Token inválido ou expirado')
        }

        user.senha = await bcrypt.hash(novaSenha, 10)
        user.resetToken = null
        user.tokenExpires = null

        await user.save()

        res.redirect('/entrar')
    } catch (error) {
        console.error('Erro ao redefinir senha:', error)
        res.status(500).send('Erro ao redefinir senha')
    }
})

// Rota principal
app.get('/', function(req, res){
    res.render('index')
})

// Rotas de autenticação
app.get('/entrar', function(req, res){
    res.render('entrar')
})

app.post('/login_medico', (req, res) => {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) {
            return res.render('login_medico', { message: 'Senha ou email incorreto' });
        }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            return res.redirect('/medico');
        });
    })(req, res, next);
})

app.get('/login_recepcionista', (req, res) => {
    res.render('login_recepcionista');
})

app.post('/login_recepcionista', (req, res) => {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) {
            return res.render('login_recepcionista', { message: 'Senha ou email incorreto' });
        }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            return res.redirect('/recepcao');
        });
    })(req, res, next);
})
    

app.post('/entrar', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) {
            return res.render('entrar', { message: 'Senha ou email incorreto' });
        }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            return res.redirect('/perfil');
        });
    })(req, res, next);
});

app.get('/criar', function(req, res){
    res.render('criar')
})

app.post('/criar', async function (req, res) {
    try {        
        console.log(req.body)
        
        const saltRounds = 10 // Número de rounds para gerar o salt
        
        const hashedSenha = await bcrypt.hash(req.body.senha, saltRounds)

        await Post.create({
            nome: req.body.nome,
            email: req.body.email,
            telefone: req.body.telefone,
            cpf: req.body.cpf,
            senha: hashedSenha
        })

        res.redirect('/entrar')
    } catch (erro) {
        res.send('Falha ao cadastrar os dados: ' + erro)
        console.log('Falha ao cadastrar os dados: ' + erro)
    }
})

// Middleware para garantir autenticação
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    } else {
        res.redirect('/entrar')
    }
}

// Rota do perfil do usuário
app.get('/perfil', ensureAuthenticated, async function (req, res) {
    try {
        const user = await Post.findOne({ where: { email: req.user.email } 
        })

        // Buscar as consultas do usuário
        const agendamentos = await Agendamento.findAll({
            where: { userId: req.user.id }
        })
               

        res.render('perfil', {
            user: user ? user.dataValues : {},
            agendamentos: agendamentos.map(app => app.dataValues) // Passar os dados das consultas para a view
        }); 
    } catch (error) {
        console.error('Erro ao buscar dados do usuário ou consultas:', error)
        res.status(500).send('Erro ao buscar dados do usuário ou consultas')        
    }
})
/* */
app.get('/cliente', function(req, res){
    res.render('cliente')
    if('/perfil', function(req, res){
        res.render('perfil')
    })
    res.render('entrar')
})
/* */

// Renderizar a página de agendamento com os agendamentos do usuário
app.get('/agendar', ensureAuthenticated, async (req, res) => {
    try {
        const agendamentos = await Agendamento.findAll({
            where: { userId: req.user.id }
        });
        res.render('agendar', { agendamentos });
    } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
        res.status(500).send('Erro ao buscar agendamentos');
    }
});

// Endpoint para criar um novo agendamento
app.post('/agendar', ensureAuthenticated, async (req, res) => {
    const { especialidade, data} = req.body;
    const userId = req.user.id;

    try {
        // Verificar se já existe um agendamento para o mesmo usuário na mesma data
        const existeAgendamento = await Agendamento.findOne({
            where: {
                userId: userId,
                data: data                
            }
        });

        if (existeAgendamento) {
            return res.status(400).send('Você já tem um agendamento nesta data e horário.');
        }

        // Criar o novo agendamento
        await Agendamento.create({
            userId: userId,
            especialidade: especialidade,
            data: data            
        });

        res.redirect('/agendar');
    } catch (error) {
        console.error('Erro ao criar agendamento:', error);
        res.status(500).send('Erro ao criar agendamento');
    }
});

app.get('/prontuario', function(req, res){
    res.render('prontuario')
})

app.get('/medico', function(req, res){
    res.render('medico')
})

app.get('/recepcao', function(req, res){
    res.render('recepcao')
})

// Rotas para alterar perfil
app.get('/alterar', ensureAuthenticated, async (req, res) => {
    try {
        const user = await Post.findByPk(req.user.id)
        if (!user) {
            return res.status(404).send('Usuário não encontrado')
        }
        res.render('alterar', { user: user.dataValues })
    } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error)
        res.status(500).send('Erro ao buscar dados do usuário')
    }
})

app.post('/alterar', ensureAuthenticated, async (req, res) => {
    const { nome, email, telefone, senha } = req.body

    try {
        const user = await Post.findByPk(req.user.id)
        if (!user) {
            return res.status(404).send('Usuário não encontrado')
        }

        user.nome = nome
        user.email = email
        user.telefone = telefone
        if (senha) {
            user.senha = await bcrypt.hash(senha, 10)
        }

        await user.save()
        res.redirect('/perfil')
    } catch (error) {
        console.error('Erro ao atualizar dados do usuário:', error)
        res.status(500).send('Erro ao atualizar dados do usuário')
    }
})

app.get('/login_medico_recepcionista', (req, res) => {
    res.render('login_medico_recepcionista');
});

app.post('/login_medico_recepcionista', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) {
            return res.render('login_medico_recepcionista', { message: 'Senha ou email incorreto' });
        }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            console.log(`Usuário autenticado: ${user.username}, Papel: ${user.role}`);
            switch (user.role) {
                case 'medico':
                    return res.redirect('/login_medico');
                case 'recepcionista':
                    return res.redirect('/login_recepcionista');
                default:
                    return res.redirect('/');
            }
        });
    })(req, res, next);
});

app.get('/consultas', (req, res) => {
    Consulta.find({ medico: req.user._id }, (err, consultas) => {
        if (err) return res.status(500).send(err);
        res.render('medico', { consultas });
    });
});

app.post('/consultas/agendar', (req, res) => {
    const { pacienteId, data, horario } = req.body;
    const consulta = new Consulta({
        medico: req.user._id,
       

 paciente: pacienteId,
        data,
        horario,
        status: 'agendado'
    });

    consulta.save(err => {
        if (err) return res.status(500).send(err);
        res.redirect('/medico');
    });
});

app.post('/consultas/alterar', (req, res) => {
    const { consultaId, status } = req.body;

    Consulta.findByIdAndUpdate(consultaId, { status }, err => {
        if (err) return res.status(500).send(err);
        res.redirect('/medico');
    });
});

app.get('/cadastro_medico_recepcionista', (req, res) => {
    res.render('cadastro_medico_recepcionista');
})
    
app.post('/cadastro_medico_recepcionista', async function(req, res) {
    try {        
        console.log(req.body);
        
        const saltRounds = 10; // Número de rounds para gerar o salt
        const hashedSenha = await bcrypt.hash(req.body.senha, saltRounds);

        // Verificar se o usuário já existe
        const userExists = await Postmr.findOne({ where: { email: req.body.email } });
        if (userExists) {
            return res.render('cadastro_medico_recepcionista', { message: 'Email já cadastrado' });
        }

        await Postmr.create({
            nome: req.body.nome,
            email: req.body.email,
            senha: hashedSenha,
            tipo: req.body.tipo
        });

        res.redirect('/login_medico_recepcionista');
    } catch (erro) {
        res.send('Falha ao cadastrar os dados: ' + erro);
        console.log('Falha ao cadastrar os dados: ' + erro);
    }
});
    
app.get('/login_medico', (req, res) => {
    res.render('login_medico');
});

app.listen(port, function(){
    console.log(`Servidor rodando na porta ${port}`)
})

