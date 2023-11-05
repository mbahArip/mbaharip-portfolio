import { SiWakatime } from '@icons-pack/react-simple-icons';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Divider,
  Image,
  Progress,
  Spinner,
  Tooltip,
} from '@nextui-org/react';
import axios from 'axios';
import c from 'constant';
import { motion as m } from 'framer-motion';
import { icons } from 'lucide-react';
import { useEffect, useState } from 'react';
import Balancer from 'react-wrap-balancer';
import { twMerge } from 'tailwind-merge';

import Icon from 'components/Icons';
import DefaultLayout from 'components/Layout/DefaultLayout';
import Link from 'components/Link';

import { formatDate, formatRelativeDate } from 'utils/dataFormatter';
import getOptimizedImage from 'utils/getOptimizedImage';

import { WakaStats } from 'types/Api';

import dataSkills from 'data/skills';
import categoryColors from 'data/waka-colors/category.json';
import languageColors from 'data/waka-colors/lang.json';
import dataWorkspaces from 'data/workspace';

const skillsContainer = {
  hidden: {
    opacity: 1,
  },
  show: {
    opacity: 1,
    transition: {
      delay: c.ANIM_DELAY * 2,
      when: 'beforeChildren',
      staggerChildren: 0.125,
    },
  },
};
const skillsItem = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
    },
  },
};
export default function About() {
  const [wakaStats, setWakaStats] = useState<WakaStats | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const wakaStats = await axios.get<WakaStats>('/api/waka').then((res) => res.data);
      setWakaStats(wakaStats);
    };

    fetchData();
  }, []);

  return (
    <DefaultLayout
      seo={{
        title: 'About me',
      }}
    >
      {/* Header */}
      <div className='center-max-xl flex flex-col items-center justify-center gap-8'>
        <div className='flex w-full flex-col items-start'>
          <h1>About me</h1>
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
            Some information about me and my journey.
          </m.span>
        </div>
      </div>
      <Divider />

      {/* About */}
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
        className='center-max-lg flex w-full flex-col items-center justify-center gap-4 lg:flex-row lg:gap-16'
      >
        <div className='flex w-full flex-col items-center justify-center gap-4'>
          <m.div
            initial={{
              opacity: 0,
              scale: 1.5,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.5,
              ease: 'easeInOut',
              type: 'tween',
              delay: c.ANIM_DELAY * 1,
            }}
          >
            <Tooltip
              content='This is me! 👋'
              showArrow
            >
              <Image
                src={getOptimizedImage(
                  'https://cdn.discordapp.com/attachments/1162049001403723848/1162836977213784094/312925661_3311577849161596_6923541420924635551_n.png',
                  {
                    width: 256,
                    height: 256,
                  },
                )}
                alt='Arief Rachmawan'
                radius='full'
                classNames={{
                  img: 'w-40 h-40 lg:w-48 lg:h-48 object-cover object-center',
                  wrapper: 'p-1 border-4 border-primary',
                }}
              />
            </Tooltip>
          </m.div>
          <m.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              ease: 'easeInOut',
              type: 'tween',
              delay: c.ANIM_DELAY * 2,
            }}
            className='flex flex-col items-center gap-2'
          >
            <Button
              as={Link}
              href='/resume'
              variant='shadow'
              startContent={<Icon name='Download' />}
            >
              Download Resume
            </Button>
            <span className='text-tiny text-default-400'>Last updated on 2021-08-01</span>
          </m.div>
        </div>
        <div className='flex flex-col gap-4'>
          <m.p
            initial={{
              opacity: 0,
              x: -100,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.5,
              ease: 'easeInOut',
              type: 'tween',
              delay: c.ANIM_DELAY * 1,
            }}
            className='w-full text-center lg:text-start'
          >
            <Balancer>
              Hi, I&apos;m <b>Arief Rachmawan</b> also known as mbaharip, a software engineer graduate (2023)
              specializing in <b>web development</b>. I&apos;m passionate about building user interface and designing
              the logic behind them.
            </Balancer>
          </m.p>
          <m.p
            initial={{
              opacity: 0,
              x: 100,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.5,
              ease: 'easeInOut',
              type: 'tween',
              delay: c.ANIM_DELAY * 1,
            }}
            className='w-full text-center lg:text-start'
          >
            <Balancer preferNative>
              During my studies at{' '}
              <Link
                href='https://sttbandung.ac.id'
                isExternal
                showAnchorIcon
              >
                Sekolah Tinggi Teknologi Bandung
              </Link>
              , I had the opportunity to learn{' '}
              <b className='underline decoration-primary decoration-2 underline-offset-2'>Game Development</b> at{' '}
              <Link
                href='https://academy.agate.id/'
                isExternal
                showAnchorIcon
              >
                Agate Academy
              </Link>{' '}
              through Kampus Merdeka Batch 1 and{' '}
              <b className='underline decoration-primary decoration-2 underline-offset-2'>
                Frontend Development using React
              </b>{' '}
              at{' '}
              <Link
                href='https://academy.alterra.id'
                isExternal
                showAnchorIcon
              >
                Alterra Academy
              </Link>{' '}
              through Kampus Merdeka Batch 2. I also had the opportunity to intern at the{' '}
              <b className='underline decoration-primary decoration-2 underline-offset-2'>
                Bandung City Government Documentation and Network Information (JDIH)
              </b>
              .
            </Balancer>
          </m.p>
          <m.p
            initial={{
              opacity: 0,
              x: -100,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.5,
              ease: 'easeInOut',
              type: 'tween',
              delay: c.ANIM_DELAY * 1,
            }}
            className='w-full text-center lg:text-start'
          >
            <Balancer>
              Outside of programming, I enjoy playing video games, watching anime, reading manga, making 3D models, and
              designing car wraps. <br />
              You can check out my 3D models and car wrap designs on <Link href='/3d'>3D page</Link>.
            </Balancer>
          </m.p>
        </div>
      </m.div>

      {/* Skills */}
      <m.div
        initial={{
          opacity: 0,
          y: 50,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
          ease: 'easeInOut',
          type: 'tween',
          delay: c.ANIM_DELAY * 2,
          when: 'beforeChildren',
        }}
        className='center-max-lg mt-8 flex w-full flex-col'
      >
        <div>
          <h3>Skills</h3>
          <span className='text-small text-default-500'>Some skills that I&apos;ve learned.</span>
        </div>
        <div className='my-2 w-full border-b-1 border-dotted border-divider' />
        <m.div
          variants={skillsContainer}
          initial={'hidden'}
          animate={'show'}
          className='grid grid-cols-1 gap-4 lg:grid-cols-2 '
        >
          {dataSkills.map((skill) => (
            <m.div
              variants={skillsItem}
              key={skill.name}
              className='height-auto relative box-border flex flex-col overflow-hidden rounded-large bg-content1 text-foreground shadow-medium outline-none transition-transform-background data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-focus motion-reduce:transition-none'
            >
              <Card
                key={skill.name}
                // className='flex w-full flex-col'
                classNames={{
                  header: 'flex flex-col items-start',
                  body: 'p-2 flex w-full flex-row flex-wrap gap-2',
                }}
                shadow='none'
              >
                <CardHeader>
                  <h4 className='flex items-center gap-2'>
                    <Icon name={skill.icon} />
                    {skill.name}
                  </h4>
                  <span className='text-small text-default-500'>{skill.description}</span>
                </CardHeader>
                <CardBody>
                  {skill.skills.map((s) => {
                    const SkillIcon = s.icon;
                    return (
                      <Chip
                        key={s.name}
                        classNames={{
                          base: 'pl-3 border flex items-center gap-1 select-none',
                          content: 'font-semibold',
                        }}
                        style={{
                          backgroundColor: s.color + '20',
                          borderColor: s.color === '#000000' ? '#ECEDEEC0' : s.color,
                          color: s.color === '#000000' ? '#ECEDEE' : s.color,
                        }}
                        startContent={<SkillIcon className='h-4 w-4 lg:h-5 lg:w-5' />}
                      >
                        {s.name}
                      </Chip>
                    );
                  })}
                </CardBody>
              </Card>
            </m.div>
          ))}
        </m.div>
      </m.div>

      {/* Stats */}
      <m.div
        initial={{
          opacity: 0,
          y: 50,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
          ease: 'easeInOut',
          type: 'tween',
          delay: c.ANIM_DELAY * 4,
          when: 'beforeChildren',
        }}
        className='center-max-lg mt-8 flex w-full flex-col'
      >
        <div>
          <h3>Stats</h3>
          <span className='flex items-center gap-2 text-small text-default-500'>
            My coding activity provided by{' '}
            <Link
              href='https://www.wakatime.com'
              isExternal
              color='foreground'
              className='flex items-center gap-0.5 text-small'
            >
              <SiWakatime size={12} /> Wakatime
            </Link>
          </span>
        </div>
        <div className='my-2 w-full border-b-1 border-dotted border-divider' />
        <m.div
          variants={skillsContainer}
          initial={'hidden'}
          animate={'show'}
          className='grid grid-cols-1 gap-4'
        >
          <Card
            classNames={{
              header: 'hidden flex-col items-start',
              body: 'py-2 flex w-full flex-row items-center justify-center flex-wrap gap-2',
              footer: 'justify-between text-tiny',
            }}
          >
            <CardHeader>
              <h4 className='flex items-center gap-2'>
                <SiWakatime className='h-4 w-4 lg:h-5 lg:w-5' />
                WakaTime
              </h4>
              <span className='text-small text-default-500'>My coding activity on WakaTime for the last 7 days.</span>
            </CardHeader>
            <CardBody>
              {wakaStats ? (
                <div className='grid w-full grid-cols-1 gap-4 md:grid-cols-2'>
                  <StatsCard title='Daily average'>{wakaStats.human_readable_daily_average}</StatsCard>
                  <StatsCard title='This week'>{wakaStats.human_readable_total}</StatsCard>
                  <StatsCard title='Best record'>
                    <div className='flex flex-col'>
                      <span className='font-semibold'>{wakaStats.best_day.text}</span>
                      <span className='text-tiny text-default-400'>{formatDate(wakaStats.best_day.date)}</span>
                    </div>
                  </StatsCard>
                  <StatsCard title='Total coding time'>
                    <div className='flex flex-col'>
                      <span className='font-semibold'>{wakaStats.all_time.text}</span>
                      <span className='text-tiny text-default-400'>
                        Since {formatDate(wakaStats.all_time.range.start_date)}
                      </span>
                    </div>
                  </StatsCard>
                  <StatsCard
                    title='Languages'
                    className='col-span-full md:col-span-1'
                  >
                    <div className='flex h-full flex-shrink-0 flex-col'>
                      {wakaStats.languages.slice(0, 3).map((lang, index) => {
                        const color = languageColors.find((l) => l.name === lang.name)?.color;
                        return (
                          <div
                            key={lang.name}
                            className='flex flex-shrink-0 flex-col'
                          >
                            <span className={'flex items-center gap-2 text-base'}>{lang.name}</span>
                            <div className='flex items-center gap-2'>
                              <Progress
                                aria-label={`Total time stats for ${lang.name}`}
                                value={lang.percent}
                                classNames={{
                                  base: 'h-2',
                                  track: 'h-2',
                                  indicator: 'background-overrides',
                                }}
                                style={
                                  {
                                    '--background-color': color ? color : '#ECEDEE',
                                  } as React.CSSProperties
                                }
                              />
                              <span className='text-small text-default-500'>{lang.percent}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </StatsCard>
                  <StatsCard
                    title='Activity'
                    icon='Activity'
                    className='col-span-full md:col-span-1'
                  >
                    <div className='flex h-full flex-shrink-0 flex-col'>
                      {wakaStats.categories.slice(0, 3).map((cat, index) => {
                        const color = categoryColors.find((l) => l.name === cat.name)?.color;

                        return (
                          <div
                            key={cat.name}
                            className='flex flex-shrink-0 flex-col'
                          >
                            <span className={'text-base'}>{cat.name}</span>
                            <div className='flex items-center gap-2'>
                              <Progress
                                aria-label={`Total time stats for ${cat.name}`}
                                value={cat.percent}
                                classNames={{
                                  base: 'h-2',
                                  track: 'h-2',
                                  indicator: 'background-overrides',
                                }}
                                style={
                                  {
                                    '--background-color': color ? color : '#ECEDEE',
                                  } as React.CSSProperties
                                }
                              />
                              <span className='text-small text-default-500'>{cat.percent}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </StatsCard>
                </div>
              ) : (
                <div className='flex items-center justify-center py-8'>
                  <Spinner />
                </div>
              )}
            </CardBody>
            <CardFooter>
              <span className='text-tiny text-default-500'>
                {wakaStats && wakaStats.modified_at
                  ? `
                Last updated: ${formatRelativeDate(wakaStats.modified_at)}
                `
                  : null}
              </span>
              <Link
                href='https://wakatime.com/@mbaharip'
                isExternal
                showAnchorIcon
                className='text-tiny'
              >
                See more on WakaTime
              </Link>
            </CardFooter>
          </Card>
        </m.div>
      </m.div>

      {/* Workspace */}
      <m.div
        initial={{
          opacity: 0,
          y: 50,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
          ease: 'easeInOut',
          type: 'tween',
          delay: c.ANIM_DELAY * 6,
          when: 'beforeChildren',
        }}
        className='center-max-lg mt-8 flex w-full flex-col'
      >
        <div>
          <h3>Workspace</h3>
          <span className='flex items-center gap-2 text-small text-default-500'>
            A place where I spend most of my time.
          </span>
        </div>
        <div className='my-2 w-full border-b-1 border-dotted border-divider' />

        <m.div
          variants={skillsContainer}
          initial={'hidden'}
          animate={'show'}
        >
          <m.div
            initial={{
              opacity: 0,
              y: 50,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              ease: 'easeInOut',
              type: 'tween',
              delay: c.ANIM_DELAY * 3,
              when: 'beforeChildren',
            }}
            className='center-max-lg flex w-full flex-col items-center justify-center'
          >
            <Image
              src='https://picsum.photos/700/400'
              alt='My workspace'
            />
          </m.div>
          <m.div
            variants={skillsContainer}
            initial={'hidden'}
            animate={'show'}
            className='center-max-lg my-4 flex flex-col gap-2'
          >
            <m.p variants={skillsItem}>
              Here where I spend most of my time, working on my projects, doing my assignments, and playing games.
              <br />
              Some items on my desk:
            </m.p>
            <m.div
              variants={skillsContainer}
              initial={'hidden'}
              animate={'show'}
              className='grid grid-cols-1 gap-4 md:grid-cols-2'
            >
              <m.div
                variants={skillsItem}
                className='flex flex-col gap-2'
              >
                <h5 className='flex items-center gap-2'>
                  <Icon name='Laptop2' /> PC Specs
                </h5>
                <Divider />
                <ul>
                  {dataWorkspaces.specs.map((item) => (
                    <li
                      key={item.title}
                      className='flex items-start gap-4'
                    >
                      <span className='whitespace-nowrap'>
                        <b>{item.title}</b>
                      </span>
                      <Link
                        as={!item.url ? 'span' : undefined}
                        href={item.url ?? undefined}
                        isExternal
                        color={item.url ? 'primary' : 'foreground'}
                        className={twMerge(!item.url && 'hover:opacity-100')}
                      >
                        {item.value}
                      </Link>
                    </li>
                  ))}
                </ul>
              </m.div>
              <m.div
                variants={skillsItem}
                className='flex flex-col gap-2'
              >
                <h5 className='flex items-center gap-2'>
                  <Icon name='Keyboard' /> Peripherals
                </h5>
                <Divider />
                <ul>
                  {dataWorkspaces.peripherals.map((item) => (
                    <li
                      key={item.title}
                      className='flex items-start gap-4'
                    >
                      <span className='whitespace-nowrap'>
                        <b>{item.title}</b>
                      </span>
                      <Link
                        as={!item.url ? 'span' : undefined}
                        href={item.url ?? undefined}
                        isExternal
                        color={item.url ? 'primary' : 'foreground'}
                        className={twMerge(!item.url && 'hover:opacity-100')}
                      >
                        {item.value}
                      </Link>
                    </li>
                  ))}
                </ul>
              </m.div>
              <m.div
                variants={skillsItem}
                className='flex flex-col gap-2'
              >
                <h5 className='flex items-center gap-2'>
                  <Icon name='Music' /> Audio Setup
                </h5>
                <Divider />
                <ul>
                  {dataWorkspaces.audio.map((item) => (
                    <li
                      key={item.title}
                      className='flex items-start gap-4'
                    >
                      <span className='whitespace-nowrap'>
                        <b>{item.title}</b>
                      </span>
                      <Link
                        as={!item.url ? 'span' : undefined}
                        href={item.url ?? undefined}
                        isExternal
                        color={item.url ? 'primary' : 'foreground'}
                        className={twMerge(!item.url && 'hover:opacity-100')}
                      >
                        {item.value}
                      </Link>
                    </li>
                  ))}
                </ul>
              </m.div>
              <m.div
                variants={skillsItem}
                className='flex flex-col gap-2'
              >
                <h5 className='flex items-center gap-2'>
                  <Icon name='Heart' /> Other stuff
                </h5>
                <Divider />
                <ul>
                  {dataWorkspaces.other.map((item) => (
                    <li
                      key={item.title}
                      className='flex items-start gap-4'
                    >
                      <span className='whitespace-nowrap'>
                        <b>{item.title}</b>
                      </span>
                      <Link
                        as={!item.url ? 'span' : undefined}
                        href={item.url ?? undefined}
                        isExternal
                        color={item.url ? 'primary' : 'foreground'}
                        className={twMerge(!item.url && 'hover:opacity-100')}
                      >
                        {item.value}
                      </Link>
                    </li>
                  ))}
                </ul>
              </m.div>
            </m.div>
          </m.div>
        </m.div>
      </m.div>
    </DefaultLayout>
  );
}

interface StatsCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: keyof typeof icons;
}
function StatsCard({ title, children, icon, className }: StatsCardProps) {
  return (
    <div
      className={twMerge(
        'flex flex-col gap-2 rounded-medium border border-divider bg-content2 px-4 py-2 shadow-medium',
        className,
      )}
    >
      <h6 className='flex items-center gap-1.5 text-small'>
        {icon && (
          <Icon
            name={icon}
            size='sm'
          />
        )}
        <span>{title}</span>
      </h6>
      <div className='text-2xl font-semibold'>{children}</div>
    </div>
  );
}
