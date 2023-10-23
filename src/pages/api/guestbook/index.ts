import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

import supabase from 'utils/client/supabase';

import { DbGuestbookCreate } from 'types/Supabase';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method !== 'POST') {
    response.status(405).json({ message: 'Method not allowed' });
  }
  try {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      return response.status(401).json({ message: 'Unauthorized' });
    }

    // Check token;
    const body = new FormData();
    body.append(
      'secret',
      process.env.NODE_ENV === 'production'
        ? (process.env.RECAPTCHA_SECRET_KEY as string)
        : '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe',
    );
    body.append('response', token);
    const validity = await axios.post('https://www.google.com/recaptcha/api/siteverify', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    if (!validity.data.success) {
      return response.status(401).json({ message: 'Failed to verify Captcha' });
    }

    const { name, message, avatar } = request.body as DbGuestbookCreate;
    if (!name || !message) {
      return response.status(400).json({ message: 'One or more fields are missing' });
    }

    // Check if message contains malicious intent
    const malicious = ['<script>', 'alert(', 'console.'];
    if (malicious.some((str) => message.includes(str))) {
      return response.status(400).json({ message: 'Message contains malicious intent' });
    }

    const res = await supabase
      .from('guestbook')
      .insert({
        name,
        message,
        avatar,
        is_me: false,
      })
      .select('*')
      .single();
    if (res.error) {
      return response.status(500).json({ message: res.error.message, error: res.error });
    }

    return response.status(201).json({
      message: 'Success',
      data: res.data,
    });
  } catch (error: any) {
    return response.status(500).json({ message: error.message });
  }
}
