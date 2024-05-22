const express = require('express')
const app = express()
const handlebars = require('express-handlebars').engine
const bodyParser = require('body-parser')
const post = require('./models/post')
const bcrypt = require('bcrypt')
const session = require('express-session')


app.engine('handlebars', handlebars({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

app.use(express.static(path.join(__dirname, 'public')))

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use(session({
    secret: 'secretKey', // substitua por uma chave secreta segura
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // use secure: true se estiver usando HTTPS
}))


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
            return false;
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

app.get('/novasenha', function(req, res){
    res.render('novasenha')
})

app.get('/recuperar', function(req, res){
    res.render('recuperar')
})

app.get('/prontuario', function(req, res){
    res.render('prontuario')
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
})
