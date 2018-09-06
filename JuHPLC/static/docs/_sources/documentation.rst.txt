Modifying the Documentation
===========================

The documentation is located inside the ``docs`` folder in the main directory of the application.

Using sphinx with the readthedocs template you can switch into that directory and execute ``sphinx-autobuild source/ ../JuHPLC/static/docs/`` to build the documentation automatically.

If sphinx-autobuild is running successfully you can now modify the documentation files in the ``docs`` directory and the changes will automatically be reflected in the docs available on the system.

You can visit them by using any browser and visiting http://localhost:8000/ thus using the sphinx-autobuild webserver. Also the docs-files will be deployed to the statics/docs directory. This way you can access the docs by running the juhplc application and visiting the django-webserver of this application e.g.``http://localhost/static/docs/index.html``.

.. note:: It is required to append ``index.html`` since django does not automatically reference an index file and does not support directory listing.