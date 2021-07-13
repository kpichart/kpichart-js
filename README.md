# yamak-js
The javascript client for Yamak Analytics https://yamak.io

This library allows you to track events in the browser and see them aggregated in yamak dashboard.

## Getting Started

### With npm or yarn:

You can just install from npm or yarn:

```sh
npm install yamak-js
```

Then import as a `commonjs` module:

```js
const { init, track, props } = require('yamak-js')
```

Or as an `es6` module:

```ts
import { init, track, props } from 'yamak-js'
```

And track event and page view:

```js
// Initialize for your project, you can find project_id on your dashboard
init('3VK-O86-9E5A')

// ...

// track event
track('Product viewed', {
  props: {
    Name: 'Casio Chronograph Watch',
    Category: 'Mens Accessories',
    Price: 99.19
  },
})
```

### With the umd build

```html
<script src="https://yamak.io/js/yamak.js"></script>

<script>
  // Initialize for your project,
  // you can find this on your dashboard
  yamak.init('3VK-O86-9E5A')

  // ...

  // track event
  yamak.track('Product viewed', {
    props: {
      Name: 'Casio Chronograph Watch',
      Category: 'Mens Accessories',
      Price: 99.19
    },
  })
</script>
```

## Guides

### Tracking simple events

Just call `track(eventName)`

```js
track('Product viewed')
```

Here is the result in the dashboard:
*todo*

### Custom props

`yamak-js` ships with multiple built-in props, to track values that are often useful, use as follow:

```js
import { props } from 'yamak-js'

track('Read Post', {
  props: {
    // this will track the locale of the user, useful to know if we should translate our posts
    locale: props.locale(),
    // this will track the type of screen on which the user reads the post, useful for useability
    screenSize: props.screenType(),
  },
})
```

Result in the dashboard:
*todo*

See the full list [in the props'API documentation](#props).

### Untracking events

Certain events last through time and may be undone or cancelled after they have been logged.
For example, when tracking subscription to services or people.

For these events, it is very useful to be able to know:

- When an event is tracked
- When an event is marked as cancelled
- The current number of active (`tracked - cancelled`) events

When this flag is set to `true`, the given event is marked as cancelled.

e.g:

```js
// A user just subscribed!
track('User Subscribed', {
  props: {
    plan:'Starter',
  },
})

// A user unsbubscribed.
track('User Subscribed', {
  props: {
    plan:'Starter',
  },
  remove: true,
})
```

Here is the result in the dashboard:
*todo*

### Tracking page views

`yamak-js` provides an automatic way of collecting page views:

**Important note on bounce rate and unique views:**

Yamak does not store any cookie or local storage, it expects that you use a client-side router.
e.g. `react-router`, `nextjs`'s router, etc...

By default, does not track the `location.hash` nor the `location.search`.

### Tracking on multiple projects

The calls to `init()` and `track()` are wrappers are methods on the `App` class.
You may instantiate any use one app per project - with or without the default App:

```js
import { App, props } from 'yamak-js'

// equivalent to init("project-1-id")
const app1 = new App('project-1-id')
const app2 = new App('project-2-id')

// will show up in project 1's dashboard
app1.track('User Registered', {
  props: {
    method: "google",
    from: "top-link",
  },
})

// will show up in project 2's dashboard
app2.track('Read Post', {
  props: {
    // this will track the locale of the user, useful to know if we should translate our posts
    locale: props.locale(),
    // this will track the type of screen on which the user reads the post, useful for useability
    screenSize: props.screenType(),
  },
})
```

## API

### `init(projectId, options)`

#### arguments

`projectId: string`
_Mandatory_
The projectId to track this event with, you can find this in the page of your project

`options:`
_Optional_
_Default value:_ `{}`

`options.ignoreErrors: boolean`
_Optional_
_Default value:_ `false`
When set to `true`, the call to `track(event)` will never throw nor log any error.
This flag should be set to `true` for production systems.

`options.disabled: boolean`
_Optional_
_Default value:_ `false`
When set to `true`, all event / pageView tracks are disabled.
This flag is useful to disable the tracking based on the environment/URL.

`options.hash: boolean`
_Optional_
_Default value:_ `false`
When set to `true`, to track the hash portion of the URL.

`options.search: boolean`
_Optional_
_Default value:_ `false`
When set to `true`, to track the search portion of the URL.

`options.excludePaths: Array`
_Optional_
_Default value:_ `false`
Prevents tracking on pages with a URL path eg: ['/blog4', '/rule/*', '/how-to-*', '/*/admin']

`options.trackOutbound: boolean`
_Optional_
_Default value:_ `false`
When set to `true`, to track the Outbound link click.

### `track(eventName, options)`

```ts
track('Product viewed', {
  props: {
    Name: 'Casio Chronograph Watch',
    Category: 'Mens Accessories',
    Price: 99.19
  },
})
```

**arguments**

`eventName`
_Mandatory_
The event to track
The name of the event to track, should be a human readable name in `Product viewed`

`options:`
_Optional_
_Default value:_ `{}`

`options.props: { [key: string]: string }`
_Optional_
_Default value:_ `{}`
A map of `(key: string) -> (value: string)` pairs.
Props is a custom properties to create your custom metrics to collect and analyze data that Yamak.io doesn’t automatically track.
You may also use the `props` variable to generate built-in values.
See the full list [in the props'API documentation](#props).

`options.unique: boolean`
_Optional_
_Default value:_ `false`
When true, check if a similar event (i.e. same eventName & same props), has already been logged **with the unique flag** in this session.
If a similar event has already been logged, it skips it.

`event.update: boolean`
_Optional_
_Default value:_ `false`
When true, only update the counts of the props, not the count of the event.

`event.remove: boolean`
_Optional_
_Default value:_ `false`
Certain events last through time and may be undone or cancelled after they have been logged.
For example, when tracking subscription to services or people.

For these events, it is very useful to be able to know:

- when an event is tracked
- when an event is marked as cancelled
- the current number of active (`tracked - cancelled`) events.

When this flag is set to `true`, the given event is marked as cancelled.

### Props

#### `props.locale()`

Gets the `locale` of the current user, for example: `en-US`, `pt-BR` or `fr-FR`.

#### `props.screenType()`

Gets the type of screen the user is currently on, possible return values:

- `"XS"` if `screen width <= 414px`: Mobile phone
- `"S"` if `screen width <= 800px`: Tablet
- `"M"` if `screen width <= 1200px`: Small laptop
- `"L"` if `screen width <= 1600px`: Large laptop / small desktop
- `"XL"` if `screen width > 1600px`: Large desktop

#### `props.referrer()`

Gets the referrer of the user.

For example `"https://google.com"` if the user came from Google.

#### `props.path(hash, search)`

```ts
props.path(hash, search)
```

Gets the current path (segment of the URL after the domain) of the user.

`hash: boolean`
_Optional_
_Default value:_ `false`
When `true`, also returns the hash segment of the URL.

`search: boolean`
_Optional_
_Default value:_ `false`
When `true`, also returns the search segment of the URL.

#### `props.transition(previous, next)`

```ts
props.transition(previous, next)
```

Gets a parameter value that represents a transition between 2 states.

`previous: string`
_Mandatory_
The previous state.

`next: string`
_Mandatory_
The next state.

#### `props.durationInterval(durationMs)`

```ts
props.durationInterval(durationMs)
```

Categorizes a given duration in possible intervals and return the interval:

- `"< 5s"` for durations less than 5 seconds
- `"< 15s"` for durations less than 15 seconds
- `"< 30s"` for durations less than 30 seconds
- `"< 1m"` for durations less than 1 minute
- `"< 5m"` for durations less than 5 minutes
- `"> 5m"` for durations of 5 minutes or more

`durationMs: number`
_Mandatory_
The duration, in milliseconds.

## License

MIT

