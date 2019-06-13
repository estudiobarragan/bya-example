'use strict'

var Topic = require('../models/topic');
var validator =require('validator');

var controller={
	add: function(req,res){
		// recoger el id del topic de la url
		var topicId = req.params.topicId;


		// finde por id del topic
		Topic.findById(topicId).exec((err,topic)=>{
			if(err){
				return res.status(500).send({
					status: 'error',
					message: "Error en la petición"
				});
			}
			if(!topic){
				return res.status(404).send({
					status: 'error',
					message: "No existe el tema"
				});
			}
			// Comprobar objeto usuario y validar datos
			if(req.body.content){
				try{
		    		var validate_content = !validator.isEmpty(req.body.content);    		
		    	}catch(err){
		    		return res.status(500).send({
		    			status:'error',
		    			message: 'No hay comentario a ingresar.'
		    		});
		    	}
		    	if(validate_content){
		    		// En la propiedad del objeto resultante hacer un push
		    		var comment = {
		    			user: req.user.sub,
		    			content: req.body.content
		    		};
		    		topic.comments.push(comment);

					// Grabar el topic completo
					topic.save((err)=>{
						if(err){
							return res.status(500).send({
								status:'error',
			    				message: 'Comentario fallo al grabar.'
			    			});
						}
                                        // Find por id del topic
                                        Topic.findById(topicId)
                                                 .populate('user')
                                                 .populate('comments.user')
                                                 .exec((err,topic)=>{
                                                        if(err){
                                                                // Devolver resultados
                                                                return res.status(500).send({
                                                                        status: 'error',
                                                                                message: 'Error en la petición'
                                                                });
                                                        }
                                                        if(!topic){
                                                                // Devolver resultados
                                                                return res.status(404).send({
                                                                        status: 'error',
                                                                                message: 'No hay topic'
                                                                });	
                                                        }
                                                        // Devolver resultados
                                                        return res.status(200).send({
                                                                status: 'success',
                                                                        topic
                                                        });
                                                 });                            
					});
		    	}else{
		    		return res.status(500).send({
		    			status:'error',
		    			message: 'No se ha validado correctamente el comentario.'
		    		});
		    	}
			}
		})
	},

	update: function(req,res){
		// Conseguir el id del comentario que viene por url
		var commentId= req.params.commentId;

		// recoger datos y validarlos
		// Comprobar objeto usuario y validar datos
		try{
    		var validate_content = !validator.isEmpty(req.body.content);    		
    	}catch(err){
    		return res.status(500).send({
    			status:'error',
    			message: 'No hay comentario a ingresar.'
    		});
    	}
    	if(validate_content){
    		// Find and update de subdocumento - comentario
    		Topic.findOneAndUpdate(
    			{"comments._id": commentId},
    			{"$set":{"comments.$.content":req.body.content}},
    			{new:true},
    			(err,topicUpdated)=>{
    				if(err){
    					return res.status(500).send({
			    			status:'error',
			    			message: 'Error en la petición.'
			    		});
    				}
    				if(!topicUpdated){
    					return res.status(404).send({
			    			status:'error',
			    			message: 'No existe el tema.'
			    		});	
    				}

	    			// DEvolver datos
					return res.status(200).send({
						status:'success',
						topic: topicUpdated
					});
				}    			
    		);
    	}else{
    		return res.status(500).send({
    			status:'error',
    			message: 'No se ha validado correctamente el comentario.'
    		});
    	}

	},

	delete: function(req,res){
		// Sacar el id del topic y del comentario a borrar
		var topicId =req.params.topicId;
		var commentId = req.params.commentId;

		// Buscar el topic
		Topic.findById(topicId, (err,topic)=>{
			if(err){
				return res.status(500).send({
	    			status:'error',
	    			message: 'Error en la petición.'
	    		});
			}
			if(!topic){
				return res.status(404).send({
	    			status:'error',
	    			message: 'No existe el tema.'
	    		});	
			}

			// Seleccionar el subdocumento (comentario)
			var comment = topic.comments.id(commentId);

			// Borrar el comentario
			if(comment){
				comment.remove();
				// Guardar el topic
				topic.save((err)=>{
					if(err){
						return res.status(500).send({
			    			status:'error',
			    			message: 'Error en la petición.'
			    		});
					}
					// Find por id del topic
                                        Topic.findById(topicId)
                                                 .populate('user')
                                                 .populate('comments.user')
                                                 .exec((err,topic)=>{
                                                        if(err){
                                                                // Devolver resultados
                                                                return res.status(500).send({
                                                                        status: 'error',
                                                                                message: 'Error en la petición'
                                                                });
                                                        }
                                                        if(!topic){
                                                                // Devolver resultados
                                                                return res.status(404).send({
                                                                        status: 'error',
                                                                                message: 'No hay topic'
                                                                });	
                                                        }
                                                        // Devolver resultados
                                                        return res.status(200).send({
                                                                status: 'success',
                                                                        topic
                                                        });
                                                 });
				});				
			}else{
				return res.status(404).send({
	    			status:'error',
	    			message: 'No existe el comentario.'
	    		});	
			}			

		});
		
	} //fin de la funcion
	
};

module.exports = controller;