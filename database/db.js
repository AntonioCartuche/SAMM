const mysql = require('mysql');


const connection = mysql.createConnection({
  host: 'sammdb.mysql.database.azure.com',
  user: 'antonio',
  password: 'tonio689@',
  database: 'sammdb'
});



connection.connect((error)=>{
    if(error){
        console.log('El error de conexion es :'+error);
        return;
    }
    console.log('Conexion OK BD');
});
module.exports = connection;