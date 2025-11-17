import { useState, useEffect } from 'react';
import {
  useAuthState,
  useDataQuery,
  useDataUpdate,
} from '../utilities/firebase.ts';
import { useProfiles } from '../contexts/ProfilesContext.tsx';
import { type Message } from '../types/Message.ts';

const InvitationPage = () => {
  const { user } = useAuthState();
  const { getProfileById } = useProfiles();

  // Fetch incoming messages
  const incomingQueryPath = user
    ? `/invitations/${user.uid}/messages`
    : 'no-user-path';
  const [incomingMessagesData] = useDataQuery(incomingQueryPath);
  const [incomingUserMessages, setIncomingUserMessages] = useState<Message[]>(
    []
  );

  // hook to update incoming messages (we will update individual message status using relative paths)
  const [updateIncomingMessages] = useDataUpdate(incomingQueryPath);

  // Fetch all messages for outgoing filtering
  const allMessagesQueryPath = '/invitations';
  const [allMessagesData] = useDataQuery(allMessagesQueryPath);
  const [outgoingUserMessages, setOutgoingUserMessages] = useState<Message[]>(
    []
  );

  useEffect(() => {
    if (user && incomingMessagesData) {
      const messages = Object.entries(incomingMessagesData).map(
        ([id, data]: [string, any]) => ({
          id,
          ...data,
        })
      );
      setIncomingUserMessages(messages);
    } else {
      setIncomingUserMessages([]);
    }
  }, [user, incomingMessagesData]);

  useEffect(() => {
    if (user && allMessagesData) {
      const allMessages: Message[] = [];
      Object.values(allMessagesData).forEach((userMessages: any) => {
        if (userMessages.messages) {
          Object.entries(userMessages.messages).forEach(
            ([id, data]: [string, any]) => {
              allMessages.push({ id, ...data });
            }
          );
        }
      });

      const outgoing = allMessages.filter((msg) => msg.sender === user.uid);
      setOutgoingUserMessages(outgoing);
    } else {
      setOutgoingUserMessages([]);
    }
  }, [user, allMessagesData]);

  return (
    <div className="flex gap-8 w-full max-w-6xl mx-auto">
      {/* Incoming Invitations */}
      <div className="flex-1 bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-6">Incoming Invitations</h2>

        {/* Pending Invitations */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Pending
          </h3>
          <div className="space-y-4">
            {incomingUserMessages.filter(
              (msg) => !msg.status || msg.status === 'pending'
            ).length > 0 ? (
              incomingUserMessages
                .filter((msg) => !msg.status || msg.status === 'pending')
                .map((msg) => {
                  const senderProfile = getProfileById(msg.sender);
                  return (
                    <div
                      key={msg.id}
                      className="p-4 border border-slate-200 rounded-lg shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-slate-800">
                            {senderProfile?.name ?? 'Unknown User'}
                          </p>
                          <p className="text-sm text-slate-500 mt-1">
                            {msg.body ?? 'Wants to connect!'}
                          </p>
                        </div>
                        <span className="text-xs text-slate-400">
                          {msg.timestamp
                            ? new Date(msg.timestamp).toLocaleString()
                            : ''}
                        </span>
                      </div>
                      <div className="mt-4 flex gap-3 justify-end">
                        <button
                          onClick={() => {
                            updateIncomingMessages({
                              [`${msg.id}/status`]: 'accepted',
                            });
                            setIncomingUserMessages((prev) =>
                              prev.map((m) =>
                                m.id === msg.id
                                  ? { ...m, status: 'accepted' }
                                  : m
                              )
                            );
                          }}
                          className="px-3 py-1 text-sm rounded-md bg-green-500 text-white hover:bg-green-600 font-medium transition"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => {
                            updateIncomingMessages({
                              [`${msg.id}/status`]: 'rejected',
                            });
                            setIncomingUserMessages((prev) =>
                              prev.map((m) =>
                                m.id === msg.id
                                  ? { ...m, status: 'rejected' }
                                  : m
                              )
                            );
                          }}
                          className="px-3 py-1 text-sm rounded-md bg-red-500 text-white hover:bg-red-600 font-medium transition"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  );
                })
            ) : (
              <p className="text-sm text-slate-600">
                You have no pending invitations.
              </p>
            )}
          </div>
        </div>

        {/* Past Invitations */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Responded
          </h3>
          <div className="space-y-4">
            {incomingUserMessages.filter(
              (msg) =>
                msg.status === 'accepted' || msg.status === 'rejected'
            ).length > 0 ? (
              incomingUserMessages
                .filter(
                  (msg) =>
                    msg.status === 'accepted' || msg.status === 'rejected'
                )
                .map((msg) => {
                  const senderProfile = getProfileById(msg.sender);
                  return (
                    <div
                      key={msg.id}
                      className="p-4 border border-slate-200 rounded-lg bg-slate-50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-slate-800">
                            {senderProfile?.name ?? 'Unknown User'}
                          </p>
                          <p className="text-sm text-slate-500 mt-1">
                            {msg.body ?? 'Wants to connect!'}
                          </p>
                        </div>
                        <span
                          className={`text-sm font-semibold ${
                            msg.status === 'accepted'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {msg.status === 'accepted'
                            ? 'Accepted'
                            : 'Declined'}
                        </span>
                      </div>
                    </div>
                  );
                })
            ) : (
              <p className="text-sm text-slate-600">
                No past invitations.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Outgoing Invitations */}
      <div className="flex-1 bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-6">Sent Invitations</h2>
        
        {/* Pending Outgoing */}
        <div className='mb-8'>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Pending
          </h3>
          <div className="space-y-4">
            {outgoingUserMessages.filter(
                (msg) => !msg.status || msg.status === 'pending'
            ).length > 0 ? (
                outgoingUserMessages
                .filter((msg) => !msg.status || msg.status === 'pending')
                .map((msg) => {
                    const receiverProfile = getProfileById(msg.receiver);
                    return (
                        <div
                        key={msg.id}
                        className="p-4 border border-slate-200 rounded-lg shadow-sm"
                        >
                        <div className="flex justify-between items-start">
                            <div>
                            <p className="font-semibold text-slate-800">
                                To: {receiverProfile?.name ?? 'Unknown User'}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                                {msg.body ?? 'Wants to connect!'}
                            </p>
                            </div>
                            <span className="text-xs font-semibold text-slate-500">
                            PENDING
                            </span>
                        </div>
                        </div>
                    );
                    })
            ) : (
                <p className="text-sm text-slate-600">
                You have no pending outgoing invitations.
                </p>
            )}
            </div>
        </div>

        {/* Responded Outgoing */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Responded
          </h3>
          <div className="space-y-4">
            {outgoingUserMessages.filter(
                (msg) =>
                msg.status === 'accepted' || msg.status === 'rejected'
            ).length > 0 ? (
                outgoingUserMessages
                .filter(
                    (msg) =>
                    msg.status === 'accepted' || msg.status === 'rejected'
                )
                .map((msg) => {
                    const receiverProfile = getProfileById(msg.receiver);
                    return (
                        <div
                        key={msg.id}
                        className="p-4 border border-slate-200 rounded-lg bg-slate-50"
                        >
                        <div className="flex justify-between items-start">
                            <div>
                            <p className="font-semibold text-slate-800">
                                To: {receiverProfile?.name ?? 'Unknown User'}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                                {msg.body ?? 'Wants to connect!'}
                            </p>
                            </div>
                            <span
                            className={`text-sm font-semibold ${
                                msg.status === 'accepted'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                            >
                            {msg.status === 'accepted'
                                ? 'Accepted'
                                : 'Declined'}
                            </span>
                        </div>
                        </div>
                    );
                    })
            ) : (
                <p className="text-sm text-slate-600">
                No past outgoing invitations.
                </p>
            )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationPage;