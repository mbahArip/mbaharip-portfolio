import { Button, Card, CardBody, Divider, Input, Select, SelectItem, Selection, Textarea } from '@nextui-org/react';
import axios from 'axios';
import c from 'constant';
import { motion as m } from 'framer-motion';
import { LegacyRef, useEffect, useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { toast } from 'react-toastify';

import DefaultLayout from 'components/Layout/DefaultLayout';
import Link from 'components/Link';

import { State } from 'types/Common';
import { DbContactFormCreate } from 'types/Supabase';

import dataSocials from 'data/socials';

const contactContainer = {
  hidden: {
    opacity: 1,
  },
  show: {
    opacity: 1,
    transition: {
      delay: c.ANIM_DELAY * 1,
      when: 'beforeChildren',
      staggerChildren: 0.125,
    },
  },
};
const contactItem = {
  hidden: {
    opacity: 0,
    y: '50%',
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
    },
  },
};
const socialsContainer = {
  hidden: {
    opacity: 1,
  },
  show: {
    opacity: 1,
    transition: {
      delay: c.ANIM_DELAY * 1,
      when: 'beforeChildren',
      staggerChildren: 0.125,
    },
  },
};
const socialsItem = {
  hidden: {
    opacity: 0,
    y: '50%',
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
    },
  },
};

export default function Contact() {
  const [formState, setFormState] = useState<State>('disabled');

  const [formName, setFormName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formType, setFormType] = useState<Selection>(new Set([]));
  const [formMessage, setFormMessage] = useState<string>('');

  const recaptcha = useRef<ReCAPTCHA>();

  useEffect(() => {
    const isNameValid = formName.length > 0;
    const isEmailValid = formEmail.length > 0 && /\S+@\S+\.\S+/.test(formEmail);
    const isTypeValid = [...formType].length > 0;
    const isMessageValid = formMessage.length > 0;

    if (isNameValid && isEmailValid && isTypeValid && isMessageValid) {
      setFormState('idle');
    } else {
      setFormState('disabled');
    }
  }, [formName, formEmail, formType, formMessage]);

  const handleSendMail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState('loading');

    try {
      if (!recaptcha.current) throw new Error('Recaptcha is not initialized.');
      const token = await recaptcha.current.executeAsync();
      if (!token) throw new Error('Recaptcha token is not available.');

      const data: DbContactFormCreate = {
        name: formName,
        email: formEmail,
        type: [...formType][0] as string,
        message: formMessage,
      };

      await axios
        .post('/api/contact', data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => res.data);

      toast.success('Message sent successfully! Thank you for contacting me.');
      setFormName('');
      setFormEmail('');
      setFormType(new Set([]));
      setFormMessage('');
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to send message. Check console for details.');
    } finally {
      setFormState('idle');
    }
  };

  return (
    <DefaultLayout seo={{ title: 'Contact' }}>
      {/* Header */}
      <div className='center-max-xl flex flex-col items-center justify-center gap-8'>
        <div className='flex w-full flex-col items-start'>
          <h1>Contact</h1>
          <m.span
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.75,
              ease: 'easeInOut',
              type: 'tween',
            }}
            className='text-small text-default-500'
          >
            Get in touch with me.
          </m.span>
        </div>
      </div>
      {/* <Divider /> */}

      <m.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.5,
          ease: 'easeInOut',
          type: 'tween',
          delay: c.ANIM_DELAY * 1,
        }}
        className='center-max-xl mt-8 grid grid-cols-1 gap-4 overflow-y-hidden py-8 lg:grid-cols-1'
      >
        {/* Contact form */}
        <m.form
          onSubmit={handleSendMail}
          variants={contactContainer}
          initial={'hidden'}
          animate={'show'}
          className='flex flex-col gap-4'
        >
          <div>
            <h3>Contact form</h3>
            <span className='text-small text-default-500'>Send me a message.</span>
          </div>
          <Divider />

          <m.div
            variants={contactItem}
            className='flex flex-col gap-4'
          >
            <Input
              variant={'faded'}
              size='lg'
              radius='md'
              label='Name'
              labelPlacement='outside'
              placeholder='Please enter your full name'
              isRequired
              value={formName}
              onChange={(e) => {
                setFormName(e.target.value);
              }}
            />
          </m.div>

          <m.div
            variants={contactItem}
            className='flex flex-col gap-4'
          >
            <Input
              variant={'faded'}
              type='email'
              size='lg'
              radius='md'
              label='Email'
              labelPlacement='outside'
              placeholder='Please enter your email. I will reply your message to this email.'
              isRequired
              value={formEmail}
              onChange={(e) => {
                setFormEmail(e.target.value);
              }}
            />
          </m.div>

          <m.div
            variants={contactItem}
            className='flex flex-col gap-4'
          >
            <Select
              variant={'faded'}
              size='lg'
              radius='md'
              label='Inquiry type'
              labelPlacement='outside'
              placeholder='Please select a inquiry type.'
              aria-label={'Select a inquiry type.'}
              selectionMode='single'
              isRequired
              selectedKeys={formType}
              onSelectionChange={(e) => {
                setFormType(e);
              }}
            >
              <SelectItem
                key='question'
                description={'If you want to ask a question, please select this option.'}
              >
                Question
              </SelectItem>
              <SelectItem
                key='project'
                description={
                  'If you want to talk about a open source project, or a collaboration, please select this option.'
                }
              >
                Regarding a project / collaboration
              </SelectItem>
              <SelectItem
                key='commission'
                description={'If you want to talk about a commission or work, please select this option.'}
              >
                Regarding commission / work / job offer
              </SelectItem>
              <SelectItem
                key='other'
                description={'If you want to talk about something else, please select this option.'}
              >
                Other
              </SelectItem>
            </Select>
          </m.div>

          <m.div
            variants={contactItem}
            className='flex flex-col gap-4'
          >
            <Textarea
              variant={'faded'}
              size='lg'
              radius='md'
              label='Messages'
              labelPlacement='outside'
              placeholder='Please enter your message.'
              isRequired
              value={formMessage}
              onChange={(e) => {
                setFormMessage(e.target.value);
              }}
            />
          </m.div>

          <m.div
            variants={contactItem}
            className='relative flex flex-col gap-4'
          >
            <Button
              type='submit'
              variant={'shadow'}
              color='default'
              radius='md'
              isDisabled={formState === 'disabled'}
              isLoading={formState === 'loading'}
            >
              {formState === 'loading' ? 'Sending message...' : 'Send message'}
            </Button>
            <span className='text-tiny text-default-400'>
              Form are protected by reCAPTCHA and the Google{' '}
              <Link
                href='https://policies.google.com/privacy'
                isExternal
                className='text-tiny'
              >
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link
                href='https://policies.google.com/terms'
                isExternal
                className='text-tiny'
              >
                Terms of Service
              </Link>{' '}
              apply.
            </span>
            <ReCAPTCHA
              ref={recaptcha as LegacyRef<ReCAPTCHA>}
              badge='inline'
              theme='dark'
              aria-hidden
              size='invisible'
              className='invisible h-1'
              sitekey={
                process.env.NODE_ENV === 'production'
                  ? (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string)
                  : '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
              }
            />
          </m.div>
        </m.form>
        {/* Socials */}
        <m.div
          variants={socialsContainer}
          initial={'hidden'}
          animate={'show'}
          className='flex flex-col gap-4'
        >
          <div>
            <h3>Socials</h3>
            <span className='text-small text-default-500'>Contact me through my socials.</span>
          </div>
          <Divider />

          <m.div
            variants={socialsContainer}
            initial={'hidden'}
            animate={'show'}
            className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          >
            {dataSocials.map((social) => {
              const Icon = social.icon;
              return (
                <m.div
                  variants={socialsItem}
                  key={social.name}
                >
                  <Card
                    as={Link}
                    href={social.href}
                    isExternal
                    isHoverable
                    isPressable
                    radius='none'
                    shadow='none'
                    classNames={{
                      base: `w-full card ${social.name.toLowerCase()} data-[hover=true]:opacity-100`,
                      body: 'flex items-center justify-start flex-row gap-4',
                    }}
                  >
                    <CardBody>
                      <Icon className={`h-8 w-8 transition duration-150`} />
                      <h5 className='transition duration-150'>{social.name}</h5>
                    </CardBody>
                  </Card>
                </m.div>
              );
            })}
          </m.div>
        </m.div>
      </m.div>
    </DefaultLayout>
  );
}
