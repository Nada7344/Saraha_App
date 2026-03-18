
export const fileFeieldValidation ={
    image :['image/jpeg','image/png','image/jpg']
}

export const fileFilter =(validation=[])=>{
    return function(req ,file, cb){
          
        if(!validation.includes(file.mimetype)){
          
            return cb(new Error("invalid file format",{cause:{status:400}}),false)
        }
        return cb(null ,true)
    }
}