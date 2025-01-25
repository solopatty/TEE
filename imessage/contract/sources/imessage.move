module SocialApp::Messaging {
    use std::string;
    use std::vector;
    use std::event;

    struct UserProfile has key {
        username: string::String,
        friends: vector::Vector<address>,
    }

    struct Message {
        sender: address,
        content: string::String,
    }

    struct Conversation has key {
        participants: vector::Vector<address>,
        messages: vector::Vector<Message>,
    }

    struct SendMessageEvent {
        sender: address,
        recipient: address,
        content: string::String,
    }

    public fun create_user(account: &signer, username: string::String) {
        let user = UserProfile {
            username,
            friends: vector::empty(),
        };
        move_to(account, user);
    }

    public fun add_friend(account: &signer, friend_address: address) {
        let user = borrow_global_mut<UserProfile>(signer::address_of(account));
        vector::push_back(&mut user.friends, friend_address);
    }

    public fun send_message(
        account: &signer,
        recipient: address,
        content: string::String
    ) {
        let sender_address = signer::address_of(account);

        // Ensure sender has a profile
        assert!(exists<UserProfile>(sender_address), 1);

        // Ensure recipient has a profile
        assert!(exists<UserProfile>(recipient), 2);

        let conversation_address = get_conversation_address(sender_address, recipient);

        if (!exists<Conversation>(conversation_address)) {
            let participants = vector::empty();
            vector::push_back(&mut participants, sender_address);
            vector::push_back(&mut participants, recipient);

            let conversation = Conversation {
                participants,
                messages: vector::empty(),
            };
            move_to(&conversation_address, conversation);
        }

        let conversation = borrow_global_mut<Conversation>(conversation_address);
        let message = Message {
            sender: sender_address,
            content,
        };
        vector::push_back(&mut conversation.messages, message);

        // Emit a send message event
        event::emit(SendMessageEvent {
            sender: sender_address,
            recipient,
            content,
        });
    }

    public fun get_conversation(
        account: &signer,
        recipient: address
    ): vector::Vector<Message> {
        let sender_address = signer::address_of(account);
        let conversation_address = get_conversation_address(sender_address, recipient);

        assert!(exists<Conversation>(conversation_address), 3);

        let conversation = borrow_global<Conversation>(conversation_address);
        conversation.messages
    }

    public fun get_friends(account: &signer): vector::Vector<address> {
        let user = borrow_global<UserProfile>(signer::address_of(account));
        user.friends
    }

    public fun get_username(user_address: address): string::String {
        assert!(exists<UserProfile>(user_address), 4);

        let user = borrow_global<UserProfile>(user_address);
        user.username
    }

    fun get_conversation_address(a1: address, a2: address): address {
        if (a1 < a2) {
            hash::keccak256(a1, a2)
        } else {
            hash::keccak256(a2, a1)
        }
    }
}
