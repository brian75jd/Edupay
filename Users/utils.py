import phonenumbers
from Users.models import ParentUsers,ParentUserLogginSession
from django.contrib.auth.hashers import make_password,check_password
from Users.Exceptions import DuplicatePhoneException,UserCredentialException
import secrets
from django.contrib.auth import get_user_model

User = get_user_model()

def general_validate_phone(phone:str)-> dict:
    phone = phonenumbers.parse(number=phone, region='MW')

    if not phonenumbers.is_valid_number(phone) or not phonenumbers.is_possible_number(phone):
        return{
            'success':False,
            'error':'Invalid malawian phone number'
        }
    
    phone = phonenumbers.format_number(phone, phonenumbers.PhoneNumberFormat.E164)

    if User.objects.filter(phone_number = phone).exists():
        raise DuplicatePhoneException()

    return{
        'success':True,
        'phone':phone
    }


def validate_phone(phone:str)-> dict:
    phone = phonenumbers.parse(number=phone, region='MW')

    if not phonenumbers.is_valid_number(phone) or not phonenumbers.is_possible_number(phone):
        return{
            'success':False,
            'error':'Invalid malawian phone number'
        }
    
    phone = phonenumbers.format_number(phone, phonenumbers.PhoneNumberFormat.E164)

    if ParentUsers.objects.filter(phone_number = phone).exists():
        raise DuplicatePhoneException()

    return{
        'success':True,
        'phone':phone
    }


def ParentCreationView(validated_data:dict):
    phone = validated_data.get('phone_number')
    pin = validated_data.get('pin_code')

    if not all([phone, pin]):
        raise UserCredentialException()

    user = ParentUsers.objects.create(
        phone_number = phone,
        hashed_password = make_password(pin)
    )

    return True


def authenticate(phone:str, pin:str, request):
    phone  = phonenumbers.parse(number = phone, region='MW')

    phone = phonenumbers.format_number(phone, phonenumbers.PhoneNumberFormat.E164)

    try:
        parent_account = ParentUsers.objects.get(
            phone_number = phone
        )
    except ParentUsers.DoesNotExist:
        return None

    if check_password(pin, parent_account.hashed_password):
        account_session = ParentUserLogginSession.objects.create(
            user = parent_account,
            session_key = secrets.token_urlsafe(32)
        )

        request.session['session_key'] = account_session.session_key
        request.session.save()

        return True
    
    return None



    


    