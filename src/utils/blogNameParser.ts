type Return = {
  name: string;
  date: {
    day: string;
    month: string;
    year: string;
    hour: string;
    minute: string;
    second: string;
    timestamp: number;
  };
  slug: string;
};

export default function postNameParser(name: string): Return {
  // 2023-07-09_21-03-59__first-post.md
  const [timedate, fileName] = name.split('__');

  // Format time
  const [date, time] = timedate.split('_');
  const [year, month, day] = date.split('-');
  const [hour, minute, second] = time.split('-');
  const timestamp = new Date(
    `${month}/${day}/${year} ${hour}:${minute}:${second}`,
  ).getTime();

  // Format name
  const file = fileName.split('.')[0];
  const postName = fileName
    .split('-')
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ')
    .replace('.md', '');

  // Format url slug | /:date/:time/:file
  const slug = `/blogs/${year}/${month}/${day}/${hour}${minute}${second}_${file}`;

  return {
    name: postName,
    date: {
      day,
      month,
      year,
      hour,
      minute,
      second,
      timestamp,
    },
    slug,
  };
}
