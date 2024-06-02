require('dotenv').config()
const express = require('express')
const app = express()
const handlebars = require('express-handlebars').engine
const bodyParser = require('body-parser')
const nodemailer = require('nodemailer')
const post = require('./models/post')
const bcrypt = require('bcrypt')
const { Op } = require('sequelize')
const { v4: uuidv4 } = require('uuid')
const session = require('express-session')

app.engine('handlebars', handlebars({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use(session({
    secret: process.env.SECRET_KEY, // substitua por uma chave secreta segura
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // use secure: true se estiver usando HTTPS
}))

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
    }
})

app.get('/recuperar', (req, res) => {
    res.render('recuperar')
})
// Endpoint para solicitar recuperação de senha
app.post('/recuperar', async (req, res) => {
    const { email } = req.body

    try {
        const user = await post.findOne({ where: { email: email } })
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
        const user = await post.findOne({ where: { email: email, resetToken: token, tokenExpires: { [Op.gt]: Date.now() } } })
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
        const user = await post.findOne({ where: { email: email, resetToken: token, tokenExpires: { [Op.gt]: Date.now() } } })
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


app.get('/', function(req, res){
    res.render('index')
})

app.get('/entrar', function(req, res){
    res.render('entrar')
})

app.post('/entrar', async function (req, res) {
    const { email, senha } = req.body


    console.log('Dados recebidos no login:', { email, senha })

    if (!email || !senha) {
        console.log('Email ou senha não fornecidos')
        return res.json({ success: false, message: 'Email ou senha não fornecidos.' })
    }

    const isValid = await validarLogin(email, senha)

    if (isValid) {
        req.session.user = { email } // Salva o email do usuário na sessão
        res.redirect('/perfil')
    } else {
        res.json({ success: false, message: 'Email ou senha incorretos.' })
    }
})

async function validarLogin(email, senha) {
    try {
        const user = await post.findOne({ where: { email: email } })


        console.log('Usuário encontrado:', user)


        if (!user) {

            console.log('Usuário não encontrado')

            return false
        }

        if (!senha) {
            console.log('Senha não fornecida')
            return false
        }

        const isMatch = await bcrypt.compare(senha, user.senha)

        console.log('Resultado da comparação da senha:', isMatch)
        
        return isMatch
    } catch (error) {
        console.error('Erro ao validar login:', error)
        return false
    }
}

app.get('/criar', function(req, res){
    res.render('criar')
})

app.post('/criar', async function (req, res) {
    try {        
        console.log(req.body)
        
        const saltRounds = 10 // Número de rounds para gerar o salt
        
        const hashedSenha = await bcrypt.hash(req.body.senha, saltRounds)

        await post.create({
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



app.get('/perfil', async function(req, res) {
    if (!req.session.user) {
        return res.redirect('/entrar')
    }

    const user = await post.findOne({ where: { email: req.session.user.email } })
    console.log('Dados do usuário:', user)
    res.render('perfil', { user: user ? user.dataValues : {} })
})

app.get('/cliente', function(req, res){
    res.render('cliente')
})

app.get('/agendar', function(req, res){
    res.render('agendar')
})

app.get('/prontuario', function(req, res){
    res.render('prontuario')
})

app.get('/medico', function(req, res){
    res.render('medico')
})

app.get('/recepcao', function(req, res){
    res.render('recepcao')
})



app.get('/alterar', (req, res) => {
    const userId = req.user.id // Supondo que você tenha o ID do usuário na sessão ou JWT
    
    // Buscar os dados do usuário no banco de dados
    User.findById(userId, (err, user) => {
        if (err) {
            return res.status(500).send("Erro ao buscar dados do usuário.")
        }
        if (!user) {
            return res.status(404).send("Usuário não encontrado.")
        }
        console.log(user) // Verifique se os dados do usuário estão corretos
        // Renderizar a view 'alterar' passando os dados do usuário
        res.render('alterar', { user })
    });
});

app.post('/alterar', (req, res) => {
    const userId = req.user.id
    const { nome, email, telefone, senha } = req.body

    // Atualizar os dados do usuário no banco de dados
    User.findById(userId, (err, user) => {
        if (err) {
            return res.status(500).send("Erro ao buscar dados do usuário.")
        }

        // Atualizar os campos
        user.nome = nome
        user.email = email
        user.telefone = telefone
        if (senha) {
            user.senha = senha // Certifique-se de hashear a senha antes de salvar
        }

        user.save((err) => {
            if (err) {
                return res.status(500).send("Erro ao atualizar dados do usuário.")
            }
            res.redirect('/perfil')
        });
    });
});


app.post('/alterar', (req, res) => {
    const userId = req.user.id
    const { nome, email, telefone, senha } = req.body

    User.findById(userId, async (err, user) => {
        if (err) {
            return res.status(500).send("Erro ao buscar dados do usuário.")
        }

        user.nome = nome
        user.email = email
        user.telefone = telefone
        if (senha) {
            const hashedSenha = await bcrypt.hash(senha, 10) // Ajuste o fator de custo conforme necessário
            user.senha = hashedSenha
        }

        user.save((err) => {
            if (err) {
                return res.status(500).send("Erro ao atualizar dados do usuário.")
            }
            res.redirect('/perfil')
        })
    })
})



app.listen(8081, function(){
    console.log('Servidor Ativo!')
})