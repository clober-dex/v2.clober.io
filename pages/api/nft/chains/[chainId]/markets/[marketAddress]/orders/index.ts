import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  res.json({
    name: 'Clober Market Orders',
    description: 'Clober Market Orders',
    image: 'https://twitter.com/CloberDEX/header_photo',
    external_link: 'https://www.clober.io',
  })
}
