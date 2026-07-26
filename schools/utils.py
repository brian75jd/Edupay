import secrets
from datetime import timedelta
import phonenumbers
from django.contrib.auth.hashers import check_password, make_password
from django.utils import timezone

from .exceptions import (
    DuplicatePhoneException,
    InvalidCredentialsException,
    InvalidPhoneException,
    SessionExpiredException,
    StaffPermissionException,
)
from .models import School, StaffAccount, StaffLoginSession

SESSION_DURATION = timedelta(hours=12)


def normalize_phone(phone):
    parsed = phonenumbers.parse(phone, "MW")

    if not phonenumbers.is_valid_number(parsed) or not phonenumbers.is_possible_number(parsed):
        raise InvalidPhoneException()

    return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)


def register_headteacher(validated_data):
    school_data = validated_data["school"]
    account_data = validated_data["account"]

    phone_number = normalize_phone(account_data["phone_number"])
    if StaffAccount.objects.filter(phone_number=phone_number).exists():
        raise DuplicatePhoneException()

    school = School.objects.create(**school_data)

    staff = StaffAccount.objects.create(
        school=school,
        role=StaffAccount.Role.HEADTEACHER,
        first_name=account_data["first_name"],
        last_name=account_data["last_name"],
        phone_number=phone_number,
        hashed_password=make_password(account_data["password"]),
        must_change_password=False,
    )

    return staff


def add_accountant(headteacher, validated_data):
    if headteacher.role != StaffAccount.Role.HEADTEACHER:
        raise StaffPermissionException()

    phone_number = normalize_phone(validated_data["phone_number"])
    if StaffAccount.objects.filter(phone_number=phone_number).exists():
        raise DuplicatePhoneException()

    default_password = f"{validated_data['last_name'].lower()}123"

    accountant = StaffAccount.objects.create(
        school=headteacher.school,
        role=StaffAccount.Role.ACCOUNTANT,
        first_name=validated_data["first_name"],
        last_name=validated_data["last_name"],
        phone_number=phone_number,
        hashed_password=make_password(default_password),
        must_change_password=True,
    )

    return accountant, default_password


def authenticate_staff(phone_number, password, request):
    phone_number = normalize_phone(phone_number)

    try:
        staff = StaffAccount.objects.get(phone_number=phone_number, is_active=True)
    except StaffAccount.DoesNotExist:
        raise InvalidCredentialsException()

    if not check_password(password, staff.hashed_password):
        raise InvalidCredentialsException()

    session = StaffLoginSession.objects.create(
        user=staff,
        session_key=secrets.token_urlsafe(32),
    )

    request.session["staff_session_key"] = session.session_key

    return staff


def get_authenticated_staff(request):
    session_key = request.session.get("staff_session_key")
    if not session_key:
        raise SessionExpiredException()

    try:
        session = StaffLoginSession.objects.select_related("user").get(
            session_key=session_key, is_valid=True
        )
    except StaffLoginSession.DoesNotExist:
        raise SessionExpiredException()

    if timezone.now() > session.date_created + SESSION_DURATION:
        session.invalidate_session
        raise SessionExpiredException()

    return session.user


def change_credentials(staff, current_password, new_phone_number=None, new_password=None):
    if not check_password(current_password, staff.hashed_password):
        raise InvalidCredentialsException()

    if new_phone_number:
        normalized = normalize_phone(new_phone_number)
        if normalized != staff.phone_number:
            if StaffAccount.objects.filter(phone_number=normalized).exists():
                raise DuplicatePhoneException()
            staff.phone_number = normalized

    if new_password:
        staff.hashed_password = make_password(new_password)
        staff.must_change_password = False

    staff.save()
    return staff
