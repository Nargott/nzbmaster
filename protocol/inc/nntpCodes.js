module.exports = {
    CMD_HELP:{
        code: 100,
        message: "Help text follows"
    },
    CMD_CAPABILITIES:{
        code: 101,
        message: "Capability list:"
    },
    CMD_DATETIME:{
        code: 111,
        message: "Server date and time"
    },
    AUTH_AV_POSTING_ALLOWED:{
        code: 200,
        message: "Service available, posting allowed"
    },
    AUTH_AV_POSTING_NOT_ALLOWED:{
        code: 201,
        message: "Service available, posting prohibited"
    },
    CMD_MODE_R_POSTING_ALLOWED:{
        code: 200,
        message: "Posting allowed"
    },
    CMD_MODE_R_POSTING_NOT_ALLOWED:{
        code: 201,
        message: "Posting prohibited"
    },
    CMD_ARTICLE:{
        code: 220,
        message: "Article follows"
    },
    CMD_HEAD:{
        code: 221,
        message: "Article headers follow"
    },
    CMD_BODY:{
        code: 222,
        message: "Article body follow"
    },
    LOGIN_OK:{
        code: 281,
        message: "Ok"
    },
    PASS_REQUIRED:{
        code: 381,
        message: "PASS required"
    },
    AUTH_TEMP_UNAVAIL:{
        code: 400,
        message: "Service temporarily unavailable"
    },
    NO_ARTICLE:{
        code: 430,
        message: "No Such Article Found"
    },
    AUTH_REQUIRED:{
        code: 480,
        message: "Authentication required for command"
    },
    UNKNOWN_COMMAND:{
        code: 500,
        message: "Unknown command"
    },
    SYNTAX_ERROR:{
        code: 501,
        message: "Syntax Error"
    },
    AUTH_PERM_UNAVAIL:{
        code: 502,
        message: "Service permanently unavailable"
    },
    ERR_MAX_USER_CONNECTIONS:{
        code: 502,
        message: "Max user connection exceed"
    },
};