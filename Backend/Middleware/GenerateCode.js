const Team=require('../Models/Team.model');

const generatecode=async ()=>{

    const str="ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let code="";
    for(let i=0 ; i<6 ; i++){
        let index=Math.floor(Math.random() * 36);
        code=code+str[index];

    }

    while(await(Team.findOne({teamCode:code}))){
        code="";
        for(let i=0 ; i<6 ; i++){
        let index=Math.floor(Math.random() * 36);
        code=code+str[index];

        }
    }

    return code;
}

module.exports=generatecode;