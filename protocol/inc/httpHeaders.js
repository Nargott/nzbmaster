// HTTP response headers
module.exports = {
    HTTP_HEADER_EXCEPTION: {
        key: 'd-exc',
        message: ""
    },
    HTTP_HEADER_ACCOUNTS_EXCEPTIONS: {
        key: 'd-aexcs',
        message: ""
    },
    HTTP_HEADER_FINAL: {
        key: 'd-fin',
        message: "Is response code/exception is final"
    },
    HTTP_HEADER_TOTAL_TIME: {
        key: 'd-tt',
        message: "Total time to complete request"
    },
    HTTP_HEADER_MESSAGE_ID: {
        key: 'd-mid',
        message: "MessageID"
    },
    HTTP_HEADER_ACCOUNTS_ATTEMPTS: {
        key: 'd-atmp',
        message: "Account attempts timestamp"
    },
    HTTP_HEADER_ACCOUNTS_STATUSES: {
        key: 'd-ast',
        message: "Account response codes"
    },
    HTTP_HEADER_BACKENDS_MISSING: {
        key: 'd-bms',
        message: "List of backend provider article is missing on"
    },
    HTTP_HEADER_BACKENDS_AVAILABLE: {
        key: 'd-bav',
        message: "List of backend provider article is missing on"
    },
    HTTP_HEADER_CHUCK_SIZE: {
        key: 'd-chs',
        message: "Size of asrticle's chuck currently downloaded"
    },
    HTTP_HEADER_ARTICLE_COMPLETION: {
        key: 'd-acm',
        message: "Article completion percent based on expected size and currently available chunk size"
    },
    HTTP_HEADER_LOAD_CPU: {
        key: 'd-ldc',
        message: "CPU load in percents"
    },
    HTTP_HEADER_LOAD_TRAFFIC: {
        key: 'd-ldt',
        message: "Traffic load today (used) in percents"
    },
};