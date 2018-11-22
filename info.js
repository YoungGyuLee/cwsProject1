//옷과 사용자 정보.

var user_name = ["이영규", "문정준", "장용범"];

var seosor_bound = {
    "이영규" : {
        temp : {
            out_upper : 25,
            out_lower : 20,
            in_upper : 25,
            in_lower : 20
        },
        humidity : 50,
        heart : 60,
        weight : 0,
    },
    "문정준" : {
        temp : {
            out_upper : 30,
            out_lower : 22,
            in_upper : 30,
            in_lower : 24
        },
        humidity : 60,
        heart : 70,
        weight : 3,
        
    },
    "장용범" : {
        temp : {
            out_upper : 32,
            out_lower : 18,
            in_upper : 22,
            in_lower : 17
        },
        humidity : 45,
        heart : 62,
        weight : 1,    
    },
};

var state_board = {
    "이영규" :{
        heat : 22,
        humidity : 50,
        heart : "fine",
        weight : 0
    },
    "문정준":{
        heat : 26,
        humidity : 60,
        heart : "fine",
        weight : 0
    },
    "장용범":{
        heat : 23,
        humidity : 55,
        heart : "fine",
        weight : 1
    }
};


module.exports = { 
    user_name : user_name, 
    seosor_bound: seosor_bound,
    state_board : state_board
};
