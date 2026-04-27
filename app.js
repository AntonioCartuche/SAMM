
const express = require('express');
const app = express();

const dotenv = require('dotenv');
dotenv.config({ path: './env/.env', quiet: true });

const pool = require('./database/db');

const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const promClient = require('prom-client');
const register = new promClient.Registry();
promClient.collectDefaultMetrics({
  register,
  prefix: 'nodejs_',
});

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (e) {
    res.status(500).end(e.message);
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'samm-app' });
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

const bcryptjs = require('bcryptjs');

app.use(
  session({
    store: new pgSession({
      pool,
      tableName: 'session',
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);

// Antes de las rutas que hacen render: evita mezclar cabeceras con respuestas ya enviadas.
app.use((req, res, next) => {
  if (req.path === '/metrics' || req.path === '/health') {
    return next();
  }
  res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  next();
});

app.get('/login',(req, res)=>{
    res.render('login');
})

app.get('/register',(req, res)=>{
    res.render('register');
})

app.get('/principal',(req, res)=>{
    if (req.session.loggedin) {
		res.render('principal',{
			login: true,
			name: req.session.name			
            
		});		
	} else {
		res.render('index',{
			login:false,
			name:'Debe iniciar sesión',			
		});				
	}
})

app.get('/cuestionario',(req, res)=>{
    const proyectoId = req.session.proyectoId;
    if (req.session.loggedin) {
        res.render('cuestionario',{
			login: true,
			name: req.session.name,
            proyectoId: proyectoId 
		});		
	} else {
		res.render('index',{
			login:false,
			name:'Debe iniciar sesión',	
		});				
	}
})


app.get('/resultados', async (req, res)=>{
    const proyectoId = req.session.proyectoId;
    if (!proyectoId) {
        return res.status(400).send('ID del proyecto no proporcionado');
    }
    pool.query(
        'SELECT titulo, descripcion FROM proyecto WHERE id = $1',
        [proyectoId],
        (error, results) => {
        if (error) {
            return res.status(500).send('Error al consultar la base de datos');
        }

        if (results.rows.length === 0) {
            return res.status(404).send('Proyecto no encontrado');
        }

        const proyecto = results.rows[0];

    if (req.session.loggedin) {
            res.render('resultados', {
            login: true,
            name: req.session.name,
            nombreProyecto: proyecto.titulo,
            descripcionProyecto: proyecto.descripcion,
        });	
	} else {
		res.render('index',{
			login:false,
			name:'Debe iniciar sesión',			
		});				
	}
}) 
}) 


app.get('/proyecto',(req, res)=>{
    if (req.session.loggedin) {
		res.render('proyecto',{
			login: true,
			name: req.session.name,			
		});		
	} else {
		res.render('index',{
			login:false,
			name:'Debe iniciar sesión',			
		});				
	}
})

app.post('/proyecto', async (req, res)=>{
    const titulo = req.body.titulo;
    const descripcion = req.body.descripcion;
    pool.query(
        'INSERT INTO proyecto (titulo, descripcion) VALUES ($1, $2) RETURNING id',
        [titulo, descripcion],
        (error, results) => {
        if(error){
            res.render('proyecto', {
                alert: true,
                alertTitle: 'Error',
                alertMessage: '¡Datos no registrados!',
                alertIcon: 'error',
                showConfirmButton: true,
                timer: false,
                ruta: 'proyecto'
            });
        }else{
            const proyectoId = results.rows[0].id;
            req.session.proyectoId = proyectoId;
            
            res.render('proyecto', {
                alert: true,
                alertTitle: 'Registro existoso',
                alertMessage: '¡Proyecto guardado!',
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                ruta: 'cuestionario'
            });
            
        }
    })
})


app.post('/register', async (req, res)=>{
    const user = req.body.user;
    const name = req.body.name;
    const rol = req.body.rol;
    const pass = req.body.pass;
    let passordHaash = await bcryptjs.hash(pass, 8);
    pool.query(
        'INSERT INTO users (username, name, rol, pass) VALUES ($1, $2, $3, $4)',
        [user, name, rol, passordHaash],
        async(error) => {
        if(error){
            const dup =
                error.code === '23505' ||
                (error.message && error.message.includes('duplicate key'));
            res.render('register', {
                alert: true,
                alertTitle: 'Error',
                alertMessage: dup
                    ? 'Ese nombre de usuario ya existe. Elige otro.'
                    : '¡Datos no registrados!',
                alertIcon: 'error',
                showConfirmButton: true,
                timer: false,
                ruta: 'register'
            });
        }else{
            res.render('register', {
                alert: true,
                alertTitle: 'Registro',
                alertMessage: '¡Registro exitoso! Inicia sesión.',
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                ruta: 'login'
            });
        }
    })
})

app.post('/auth', async (req, res)=>{
    const user = req.body.user;
    const pass = req.body.pass;
    if(user && pass){
        pool.query('SELECT * FROM users WHERE username = $1', [user], async (error, results)=>{
            if(error){
                return res.render('login',{
                    alert: true,
                    alertTitle: 'Error',
                    alertMessage: '¡Usuario y/o password incorrecto!',
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'login'
                });
            }
            const rows = results.rows;
            if(rows.length === 0 || !(await bcryptjs.compare(pass, rows[0].pass))){
                res.render('login',{
                    alert: true,
                    alertTitle: 'Error',
                    alertMessage: '¡Usuario y/o password incorrecto!',
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'login'
                })
            }else{
                req.session.loggedin = true;             
				req.session.name = rows[0].name;
                res.render('login',{
                    alert: true,
                    alertTitle: 'Conexión Exitosa',
                    alertMessage: '¡Login Correcto!',
                    alertIcon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: 'principal'
                })
            }
        })
    }else {	
		res.status(400).send('Please enter user and Password!');
	}
})

app.get('/', (req, res) => {
	if (req.session.loggedin) {
		res.render('index', {
			login: true,
			name: req.session.name,
		});
	} else {
		res.render('index', {
			login: false,
			name: 'Debe iniciar sesión',
		});
	}
});

app.get('/logout', function (req, res) {
	req.session.destroy(() => {
	  res.redirect('/') 
	})
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  console.error(err);
  res.status(500).send('Error interno del servidor');
});

const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`SERVER RUNNING IN http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
});
