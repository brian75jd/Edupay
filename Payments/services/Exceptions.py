from rest_framework.exceptions import APIException

class PaymentCredentialException(Exception):
    pass


class SchoolExceptionError(APIException):
    status_code = 400
    default_code =  'school_error'
    default_detail ='Something went wrong'

class SchoolNotFoundException(APIException):
    status_code = 400
    default_detail = 'School Does not exist'
    default_code = 'school_error'

class RequestTimeoutException(APIException):
    default_code = ''
    status_code = ''
    default_detail = ''



class PayChanguWebhookException(APIException):
    status_code = 400
    default_detail = 'Invalid signature'
    default_code = 'signature_error'