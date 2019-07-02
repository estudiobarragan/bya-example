'use strict'

var validator = require('validator');
var bcrypt = require('bcryptjs');
var fs = require('fs');
var path = require('path');
var User = require('../models/user');
var jwt = require('../services/jwt');

var controller ={
	probando: function(req,res){
		return res.status(200).send({
			message: "soy el metodo probando"
		});
	},

	testeando: function(req,res){
        var a={"code":200,"msg":"soy yo"};
        var b=a.code;
		return res.status(b).send({
            a,b,
			message: "soy el metodo TESTEANDO"
		});
	},

	save: function(req, res){
		// Recoger los parametros de la peticion        
		var params = req.body;
		
        try{
    		// Validar los datos
    		var validate_name = !validator.isEmpty(params.name);
    		var validate_surname = !validator.isEmpty(params.surname);;
    		var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
    		var validate_password = !validator.isEmpty(params.password);
        }catch(error){
            return res.status(500).send({
                status: "success",
                message: "Error de validacion, faltan datos.", params
            });
        }
		
		if(validate_name && validate_surname && validate_email &&validate_password){
            //console.log('Validado');
            // Crear Objeto de usuario
            var user = new User();

            // Asignar valores al usuario
            user.name = params.name;
            user.surname = params.surname;
            user.email = params.email.toLowerCase();
            user.role = 'ROLE_USER';
            user.image = null;
           
            user.password = bcrypt.hashSync(params.password,10);


            //Comprobar si el usuario existe 
            User.findOne({email: user.email}, (err, issetUser) => {
                //console.log('fuera del while '+issetUser);
                if(err){
                    return res.status(400).send({
                        'message': "Registro de usuario fallido por duplicidad 1"
                    });
                }
                //console.log('Estoy por aca');
                if(!issetUser){
                    //console.log('Estoy por aca2'); 
                    //Guardar el usuario
                    user.save((err, userStored)=>{
                        if(err){
                            return res.status(500).send({
                                'message': "Error: No se pudo grabar el usuario (c1)"
                            });
                        }
                        if(!userStored){
                            return res.status(500).send({
                                'message': "Error: No se pudo grabar el usuario (c2)"
                            });
                        } else{
                            // Devolver respuesta
                            return res.status(200).send({
                                'message': "Registro de usuario exitoso",
                                'user': userStored
                            });
                        }
                    });
                }else{
                    return res.status(500).send({
                        'message': "Error: El usuario existe en la base de datos"
                    });
                }
            });
        }else{
            return res.status(500).send({'message': "El usuario existe en la DB 5"});
        }
    },

    login: function(req, res){
        // recoger los parametros de la peticion
        var params = req.body;

        try{
            // validar los datos
            var validate_email = !validator.isEmpty(params.email)&& validator.isEmail(params.email);
            var validate_password=!validator.isEmpty(params.password);
        }catch{
            return res.status(500).send({
                status: "success",
                message: "Error de validacion, faltan datos.", params
            });
        }

        if(!validate_email || !validate_password){
            return res.status(500).send({
                message: "Correo o email incorrectos."
            }) 
        }        

        // buscar usuarios que coincidan con el mail
        User.findOne({email: params.email.toLowerCase()},(err,user)=>{
            if(err){
                return res.status(500).send({
                    message: "Error al intentar identificarse"
                });
            }

            if(!user){
                return res.status(404).send({
                    message: "Error, el usuario no existe"
                });    
            }
            // si lo encuentra, comprobar la contraseña            
            bcrypt.compare(params.password, user.password, (err,check)=>{
                if(check){
                    // Generar token de jwt 
                    if(params.gettoken){
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        })

                    }
                    //Limpiar los datos a devolver
                    user.password = undefined;

                    // devolver, los datos
                    return res.status(200).send({
                        status: "success",
                        message: "Login correcto",
                        user
                    })
                    
                }else{
                    return res.status(200).send({
                        status: "error",
                        message: "Login incorrecto, correo o email incorrectos."
                    })
                }
            });            

        });        
    },

    update: function(req,res){
        // Recoger los datos del usuario
        var params = req.body;
        
        // Validar los datos
        try{
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);;
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        }catch{
            return res.status(500).send({
                status: "success",
                message: "Error de validacion, faltan datos.", params
            });
        }
        
       //if(validate_name && validate_surname && validate_email &&validate_password)

        // Eliminar propiedades que no son necesarias
        delete params.password;
        var userId = req.user.sub;

        // Comprobar que el mail sea unico
        if(req.user.email != params.email){
            User.findOne({email: params.email.toLowerCase()}, (err, user) => {
                
                if(err){
                    return res.status(400).send({
                        'message': "Error en comprobacion de unicidad de email"
                    });
                }

                if(user && user.email == params.email){
                    return res.status(400).send({
                        'message': "El correo electronico ya esta utilizado por otro usuario"
                    }); 
                }else{
                    // Buscar y actualizar documento
                    // User.findOneAndUpdate( condicion, datos a actualizar, opciones, callbak)
                    User.findOneAndUpdate({_id:  userId}, params, {new: true},(err, userUpdated)=>{ 
                        if(err){
                            return res.status(500).send({
                                status: "error",
                                message: "Fallo en la actualizacion"
                            });    
                        }
                        if(!userUpdated){
                            return res.status(500).send({
                                status: "error",
                                message: "Error en la actualizacion"
                            });    
                        }
                        // Devolver la respuesta
                        return res.status(200).send({
                            status: "success",
                            message: "Metodo de actualizacion correcta.",
                            user: userUpdated
                        });
                    });
                }  
            });
        }else{

            // Buscar y actualizar documento
            // User.findOneAndUpdate( condicion, datos a actualizar, opciones, callbak)
            User.findOneAndUpdate({_id:  userId}, params, {new: true},(err, userUpdated)=>{ 
                if(err){
                    return res.status(500).send({
                        status: "error",
                        message: "Fallo en la actualizacion"
                    });    
                }
                if(!userUpdated){
                    return res.status(500).send({
                        status: "error",
                        message: "Error en la actualizacion"
                    });    
                }
                // Devolver la respuesta
                return res.status(200).send({
                    status: "success",
                    message: "Metodo de actualizacion correcta.",
                    user: userUpdated
                });
            });
        }

    },

    uploadAvatar: function(req,res){
        // Configurar modulo multiparty (md) para subir imagen (hecho en routes/user.js)

        // Recoger el fichero de la peticion
        var file_name = 'Avatar no subido...';

        if(!req.files){
            return res.status(404).send({
                status: "error",
                message: file_name 
            });
        }


        // Conseguir el nombre y la extension del archivo subido
        var file_path = req.files.file0.path;
        var file_split = file_path.split('\\');

        // ** Adverntencia ** en linux o mac, cambiar a
        // var file_split = file_path.split('/');

        var file_name = file_split[2];

        // Extension del archivo
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        // Comprobar extension (solo imagenes), sino es valida borrar el archivo subido.
        if(file_ext !='png' && file_ext !='jpg' && file_ext !='jpeg' && file_ext !='gif'){
            fs.unlink(file_path, (err)=>{
                return res.status(500).send({
                    status: "error",
                    message: "La extension del archivo es inconrrecta",
                    file_ext
                });
            })
        }else{

            // Que el usuario sea el identificado
            var userId = req.user.sub;

            // Buscar y actualizar documento bd
            User.findOneAndUpdate({_id: userId},{image: file_name},{new:true},(err,userUpdated)=>{
                if(err || !userUpdated){
                    // Devolver la respuesta
                    return res.status(500).send({
                        status: "err",
                        message: "Upload avatar incorrecta."
                    });
                }
                // Devolver la respuesta
                return res.status(200).send({
                    status: "success",
                    message: "Subida del avatar correcta.",
                    user: userUpdated
                });

            });            
        }
    }, //fin funcion

    avatar: function(req,res){
        var fileName = req.params.fileName;
        var pathFile = './uploads/users/'+fileName;

        fs.exists(pathFile,(exists)=>{
            if(exists){
                return res.sendFile(path.resolve(pathFile));
            }else{
                return res.status(404).send({
                    messsage: 'La imagen no existe'
                });
            }
        })

    },// fin function
    
    getUsers: function(req, res){
        User.find().exec((err,users)=>{
            if(err || !users){
                return res.status(404).send({
                    status: 'error',
                    messsage: 'No hay usuarios que mostrar'
                });
            }

            return res.status(200).send({
                status: 'success',
                users
            })
        })

    }, // fin function

    getUser: function(req,res){
        var userId = req.params.userId;
        User.findById(userId).exec((err,user)=>{
            if(err || !user){
                return res.status(404).send({
                    status: 'error',
                    messsage: 'No existe el usuario: '+userId
                });
            }

            return res.status(200).send({
                status: 'success',
                user
            })    
        })
    }

};

module.exports = controller;