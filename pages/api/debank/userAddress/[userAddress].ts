import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { isAddress } from 'viem'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  try {
    const userAddress = req.query.userAddress
    if (
      !userAddress ||
      typeof userAddress !== 'string' ||
      !isAddress(userAddress)
    ) {
      res.json({
        status: 'error',
        message: 'URL should be /api/debank/userAddress/[userAddress]',
      })
      return
    }
    const response = (await axios.get(
      `https://pro-openapi.debank.com/v1/user/total_balance?id=${userAddress.toLowerCase()}`,
      {
        headers: {
          accept: 'application/json',
          AccessKey: process.env.DEBANK_ACCESS_KEY || '',
        },
        timeout: 4 * 1000,
      },
    )) as { data: { total_usd_value: number } }

    res.json({
      status: 'success',
      message: response.data.total_usd_value.toString(),
    })
  } catch (error) {
    console.error(error)
    res.json({
      status: 'error',
      message: 'Failed to fetch data',
    })
  }
}
