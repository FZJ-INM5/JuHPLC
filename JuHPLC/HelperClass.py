class HelperClass():

    @staticmethod
    def get_client_ip(request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    @staticmethod
    def islocalhost(request):
        return True #aktuell jedes remote erlauben
        localHostAddresses = ['127.0.0.1', 'localhost', '::1']
        if HelperClass.get_client_ip(request) in localHostAddresses:
            return True
        return False

