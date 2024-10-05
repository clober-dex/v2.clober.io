import { createTamagui } from '@tamagui/core'
import { config } from '@tamagui/config/v3'

const appConfig = createTamagui(config)

export type AppConfig = typeof appConfig

declare module 'tamagui' {
  // or '@tamagui/core'
  // overrides TamaguiCustomConfig so your custom types
  // work everywhere you import `tamagui`
  interface TamaguiCustomConfig extends AppConfig {}
}

export default appConfig
