from rest_framework.permissions import BasePermission
from Users.models import ParentUserLogginSession

class HasSessionKey(BasePermission):

    def has_object_permission(self, request,view,obj):
    
         _session_key = request.session.get('session_key')

         if not _session_key:
            return None

         return True
        


        
