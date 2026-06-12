module.exports= (fn) => {
    return (req,res,next) => {
        fn(req,res,next).catch(next);
    }
}
//Extra code for testing
//utils = chote reusable tools/functions jo baar-baar use hote hain.