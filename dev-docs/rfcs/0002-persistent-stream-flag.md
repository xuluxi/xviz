- Start Date: 2019-03-07
- RFC PR: [#403](https://github.com/uber/xviz/pull/403)
- XVIZ Issue: [#64](https://github.com/uber/xviz/issues/64)

# Summary

Propose the addition of a per-stream metadata property for primitives only that will mark the stream
as being "persistent" to allow send-once data to be preserved for the duration of a session.

For the 'snapshot' update, the stream data would replace existing data and become the new stream
state. For the 'incremental' update, the stream data would be added to the current stream state.

This means that a persistent stream has a single stream state, while non-persistent streams have
state at each timestamp.

# Motivation

The majority of XVIZ data is time-based.

Today we only have two ways to control the valid duration of stream data, one at the Streetscape.gl
level and one at the XVIZ level.

Streetscape.gl, and any XVIZ compliant viewer, can get the XVIZ Config `TIME_WINDOW` which can be
set by the data source to determine the window of time that the viewer should inspect to find a
stream datum. The first datum found should be the active datum for the current viewing time. This is
an application wide mechanism so does not allow for individual stream control.

XVIZ can control invalidating a stream datum by sending an empty stream in the 'snapshot' update
message. The presence of a stream with no data is interpreted as invalidating any previous state at
that time. This works per stream, and regardless of the actual TIME_WINDOW, but requires more
tracking logic possibly in the XVIZ conversion process.

Neither of these control mechanism allow for marking data as persistent during the whole session.

# Proposal

In order to mark a stream as containing persistent data that should not be purged for the duration
of of a session I propose the following.

Adding a stream metadata property:

```
persistent: [True|False] // False is default value
```

If this property is present and **True**, then the data should be treated special by not dropping
this stream during any purge operation of XVIZ data. The data should also remain visible outside the
TIME_WINDOW setting.

Only the most recent value of the stream is required to be preserved, allowing updates to occur and
old data to be purged while maintaining overall persistence at the stream level, but not at the
individual stream object level.

If the update type is snapshot, the data is replaced. If the update type is incremental, the data
will be added to the current datum.

## Example use-case

An example use-case for this feature would be map related features, such as lane lines or traffic
set visual elements that do not move and should always be present.

In order to represent such data today you have to either send the data with every update or go
outside the XVIZ spec and provide persistent data at the application level with a custom
implementation.

## Persistent Stream semantics

| Mode        | Stream Present                 | Stream Not Present   |
| ----------- | ------------------------------ | -------------------- |
| Snapshot    | Replaces existing stream state | Becomes stream state |
| Incremental | Appends data to stream state   | Becomes stream state |

The primitive stream state `incremental` update will simply be appended to the current state array.
If an incremental entry has an `id` that duplicates an existing entry no special handling is
required.

# Out of scope

- LOD considerations
- Dynamic data management across frontend and backend

# Alternatives

The persistent flag is believe to be the simplest addition to enable session long data. Below are
other options that have been considered and why they where not part of the proposal at this time.

## Retention property

The stream metadata will define a `retention` property for a stream, which can be used to override
the application setting of TIME_WINDOW to instruct the application how long a given stream should be
visible.

I believe retention is inadequate for a persistence property for the following reasons:

## Another time encoding

Retention encodes visibile time per datum which can be seen as a per-stream replacement for
TIME_WINDOW at the XVIZ layer rather than the application layer. I could see retention **replacing**
TIME_WINDOW possibly, but could still see the need for a persistent flag. This implies a semantic
difference between the two. A sentinal value could "imply" persistence but that leads to the next
issue.

## Does not cover storage semantics

A persistent flag defines the storage as only the most recent datum + increments should remain
always.

The retention which here was considered for the visible duration, would need to be developed to
cover how it would interact with any data management. This to me signals that we are capturing
something unique in persistence that deserves a semantically different property.

## Persistent update type

A new update type that treated all data within the update as persistent could achieve the same
result. However it becomes a requirement then to define the semantics of persistent update data with
snapshot and incremental updates on a stream. Also, the semantics of adding to persistent data seems
desirable, and separating out persistent as an update type from snapshot and increment seems we
would loose the inherent value of those update types.

The complexity of this one was abandoned in favor of the simpler stream property.
