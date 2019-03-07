- Start Date: 2019-03-07
- RFC PR: [#403](https://github.com/uber/xviz/pull/403)
- XVIZ Issue: [#64](https://github.com/uber/xviz/issues/64)

# Summary

Propose the addition of a per-stream metadata property that will mark the stream as being "persistent"
to allow send-once data to be preserved for the duration of a session.  Only the most recent datum
of the stream is required to be preserved, conforming to snapshot and incremental semantics.

# Motivation

The majority of XVIZ data is time-based. 

Today we only have two ways to control the valid duration of stream data, one at the Streetscape.gl
level and one at the XVIZ level.

Streetscape.gl, and any XVIZ compliant viewer, can get the XVIZ Config `TIME_WINDOW` which can be
set by the data source to determine the window of time that the viewer should inspect to find a
stream datum.  The first datum found should be the active datum for the current viewing time.
This is an application wide mechanism so does not allow for individual stream control.

XVIZ can control invalidating a stream datum by sending an empty stream in the update message.  The
presence of a stream with no data is interpreted as invalidating any previous state at that time. This
works per stream, and regardless of the actual TIME_WINDOW, but requires more tracking logic possibly in
the XVIZ conversion process.

Neither of these control mechanism allow for marking data as persistent during the whole session.

# Proposal

In order to mark a stream as containing persistent data that should not be purged for the duration of
of a session I propose the following.

Adding a stream metadata property:
```
persistent: [True|False] // False is default value
```

If this property is present and **True**, then the data should be treated special by not dropping this stream
during any purge operation of XVIZ data.  The data should also remain visible outside the TIME_WINDOW setting.

Only the most recent value of the stream is required to be preserved, allowing updates to occur and old data to
be purged while maintaining overall persistence at the stream datum level, but not at the individual stream object level.

If the update type is snapshot, the data is replaced.  If the update type is incremental, the data will be added to the
current datum.

# Out of scope
 - LOD considerations
 - Dynamic data management across front end and backend

# Considerations

The persistent flag is believe to be the simplest addition to enable session long data. Below are other
options that have been considered and why they where not part of the proposal at this time.

# retention property
The stream metadata will define a `retention` property for a stream, which can be used to override the application setting of
TIME_WINDOW to instruct the application how long a given stream should be visible.

I believe retention is inadequate for a persistence property for the following
## Another time encoding
retention encodes visibile time per datum which can be seen as a per-stream replacement for TIME_WINDOW at the XVIZ layer
rather than the application layer.  I could see retention **replacing** TIME_WINDOW possibly, but could still see the need
for a persistent flag. This implies a semantic difference between the two.  A sentinal value could "imply" persistence but
that leads to the next issue.

## Does not cover storage semantics
A persistent flag defines the storage as only the most recent datum should remain always.

The retention which here was considered for the visible duration, would need to be developed to cover how it would interact with
any data management. This to me signals that we are capturing something unique in persistence that
deserves a semantically different property.

