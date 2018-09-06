from django.contrib.auth import authenticate, login, logout
from django.shortcuts import redirect
from django.shortcuts import render


def loginMethod(request):
    if request.method == 'GET':
        return render(request, "Login.html",{})
    elif request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('index')
        else:
            return render(request,'Login.html', {"error":"Login Failed"})

def logoutMethod(request):
    logout(request)
    return render(request, 'Login.html', {"msg":"Logout Successful"})