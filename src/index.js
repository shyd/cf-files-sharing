// src/index.js

import { Auth } from './auth';
import { StorageManager } from './storage/manager';
import { loginTemplate, mainTemplate } from './html/templates';
import { jsonResponse, htmlResponse, errorResponse } from './utils/response';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const storageManager = new StorageManager(env);

    // Determine the user's language preference
    const acceptLanguage = request.headers.get('Accept-Language') || 'en';
    const lang = acceptLanguage.includes('zh') ? 'zh' : 'en';

    // Handle file downloads
    if (url.pathname.startsWith('/file/')) {
      const id = url.pathname.split('/')[2];
      const file = await storageManager.retrieve(id);

      if (!file) {
        return errorResponse(lang === 'zh' ? '文件未找到' : 'File not found', 404);
      }

      // Ensure Chinese filenames download correctly
      const filename = file.filename;
      const encodedFilename = encodeURIComponent(filename);
      const contentDisposition = `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`;

      return new Response(file.stream, {
        headers: {
          'Content-Disposition': contentDisposition,
          'Content-Type': 'application/octet-stream',
        },
      });
    }

    // Authentication check
    if (!(await Auth.verifyAuth(request, env))) {
      if (url.pathname === '/auth' && request.method === 'POST') {
        const formData = await request.formData();
        const password = formData.get('password');

        if (await Auth.validatePassword(password, env)) {
          const token = await Auth.generateToken(env);
          const cookie = Auth.createCookie(token);

          return new Response('', {
            status: 302,
            headers: {
              'Location': '/',
              'Set-Cookie': cookie,
            },
          });
        } else {
          return htmlResponse(loginTemplate(lang, lang === 'zh' ? '密码错误' : 'Invalid password'));
        }
      }
      return htmlResponse(loginTemplate(lang));
    }

    // Handle logout
    if (url.pathname === '/logout') {
      if (request.method === 'POST') {
        const expiredCookie = Auth.createExpiredCookie();
        return new Response('', {
          status: 302,
          headers: {
            'Location': '/auth',
            'Set-Cookie': expiredCookie,
          },
        });
      } else {
        return new Response('', {
          status: 405,
          headers: {
            'Allow': 'POST',
          },
        });
      }
    }

    // Handle file deletions
    if (url.pathname === '/delete' && request.method === 'POST') {
      const formData = await request.formData();
      const id = formData.get('id');

      const success = await storageManager.delete(id);

      if (success) {
        return jsonResponse({ success: true });
      } else {
        return jsonResponse({ success: false }, 400);
      }
    }

    // Handle file uploads
    if (url.pathname === '/upload' && request.method === 'POST') {
      const formData = await request.formData();
      const file = formData.get('file');

      try {
        const metadata = await storageManager.store(file);

        return jsonResponse({
          id: metadata.id,
          filename: metadata.filename,
          size: metadata.size,
          storage_type: metadata.storage_type,
        });
      } catch (error) {
        console.error('Upload error:', error);
        return jsonResponse({ error: error.message }, 500);
      }
    }

    // Main page
    if (url.pathname === '/') {
      const files = await storageManager.list();

      return htmlResponse(mainTemplate(lang, files));
    }

    return errorResponse(lang === 'zh' ? '未找到页面' : 'Not found', 404);
  },
};
