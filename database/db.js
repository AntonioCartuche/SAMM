const mysql = require('mysql2');


const connection = mysql.createConnection({
  host: 'sammdb.mysql.database.azure.com',
  user: 'antonio',
  password: 'tonio689@',
  database: 'sammdb',
  port: 3306,
});



connection.connect((error)=>{
    if(error){
        console.log('El error de conexion es :'+error);
        return;
    }
    console.log('Conexion OK BD');
});
module.exports = connection;