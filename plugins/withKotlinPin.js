/**
 * Pin the Kotlin Gradle plugin, so a clean build works.
 *
 * Expo 52 ships a Compose compiler (1.5.15) that refuses any Kotlin but 1.9.25, and the version
 * actually resolved for `expo-modules-core` is 1.9.24, so `:expo-modules-core:compileDebugKotlin`
 * stops the build before anything is produced. The generated `build.gradle` already *defaults*
 * `kotlinVersion` to 1.9.25, but it declares the plugin with no version at all —
 * `classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')` — and the version that wins is resolved
 * elsewhere. Setting `android.kotlinVersion` does not reach it either; only the classpath does.
 *
 * This is a config plugin rather than an edit to `android/` because `npm run apk` runs
 * `prebuild --clean`, which regenerates that folder. A fix that does not survive the documented build
 * command is not a fix.
 */

const { withProjectBuildGradle } = require('expo/config-plugins');

const BARE = "classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')";
const PINNED = 'classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")';

module.exports = function withKotlinPin(config) {
  return withProjectBuildGradle(config, (mod) => {
    if (mod.modResults.language !== 'groovy') {
      throw new Error('withKotlinPin expects a groovy build.gradle');
    }
    if (mod.modResults.contents.includes(PINNED)) return mod;
    if (!mod.modResults.contents.includes(BARE)) {
      // Expo changed the line. Failing loudly beats a silent no-op that only shows up as a build
      // failure several minutes later.
      throw new Error('withKotlinPin: could not find the kotlin-gradle-plugin classpath line');
    }
    mod.modResults.contents = mod.modResults.contents.replace(BARE, PINNED);
    return mod;
  });
};
