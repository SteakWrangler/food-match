# PRD: Room Rejoining & Stats-Based Swipe Management (Final)

## **Problem Statement**
1. **Room Rejoining Bug**: Users who refresh and rejoin rooms get treated as new participants, causing false match notifications and duplicate participant entries
2. **"Take a Second Look" Bug**: Current bulk re-swipe feature creates duplicate swipe entries and corrupts room data

## **Solution Overview**

### **Fix 1: Token + Name Based Room Rejoining**

**Unique User Identity**: Combination of rejoin token + entered name
```
User joins room → generate UUID rejoinToken + store entered name
Store in: sessionStorage + room participant data
User rejoins → check sessionStorage token + user enters name
If (token + name) matches existing participant → restore as that participant
If no exact match → create new participant (even with same token, different name)
```

**Multi-Tab Support**: 
- Same device, same token, different names = different participants
- Same device, same token, same name = same participant (restored)
- Natural support for device sharing and multiple identities

**UI Prevention for Name Conflicts**:
- Change all name input labels from "Enter your name" to "Enter unique name"
- Change all name input placeholders to "Enter unique name"
- Educate users to choose unique names

**Data Structure Changes**:
```
Room participant: { id, name, rejoinToken }
SessionStorage: { rejoinToken }
Unique Identity: rejoinToken + name combination
```

### **Fix 2: Replace "Take a Second Look" with "Your Dislikes" Management**

**Remove Problematic Features**:
- Eliminate "Take a Second Look" button from end-of-restaurants screen
- Remove existing "Take a Second Look" button from Room Stats

**New "Your Dislikes" Interface**:
- Replace "Other People's Likes" tab with "Your Dislikes" tab
- Show ALL restaurants user swiped left on (regardless of others' opinions)
- Each disliked restaurant has "Change to Like" button
- No ability to change likes back to dislikes (one-way only)

**All-or-Nothing Cascade Updates**:
When "Change to Like" clicked:
1. Attempt all changes atomically:
   - Update room swipe data: participant's swipe 'left' → 'right'
   - Add restaurant to user's "Your Likes" section
   - Check for new matches → add to "Matches" if all participants like it
   - Update all like counts and statistics
   - Remove restaurant from "Your Dislikes" section
   - Trigger real-time updates for other participants
2. If ANY step fails → rollback all changes, button appears non-functional
3. If ALL steps succeed → complete update, restaurant disappears from dislikes

### **Fix 3: Simplified Room Cleanup**

**Single Cleanup Rule**: Rooms auto-close after 24 hours from creation

**Room History Preservation**: Snapshot restaurant data at room creation for logged-in users to recreate identical rooms

## **Technical Requirements**

### **Backend Changes (roomService.ts)**:
- Add `rejoinToken` field to participant objects
- Implement (token + name) combination matching in `joinRoom()`
- Add atomic all-or-nothing swipe update logic
- Implement 24-hour room cleanup system

### **Frontend Changes**:
- **UI Text Updates**: Change all name inputs to "Enter unique name"
- Replace Room Stats "Other People's Likes" with "Your Dislikes"
- Remove all "Take a Second Look" buttons  
- Implement cascade update UI with failure handling
- Store/retrieve rejoin tokens from sessionStorage with name combination logic

### **Real-Time Updates**:
- Push new matches to all participants when swipe changes create them
- Update like counts across all connected clients

## **Success Criteria**
- ✅ Users can refresh and rejoin without creating duplicate participants
- ✅ Multi-tab support allows multiple identities per device
- ✅ Users can change any individual dislike to like without data corruption
- ✅ No duplicate swipe entries possible through any user flow
- ✅ Room statistics accurately reflect changes in real-time
- ✅ Failed updates never leave interface in inconsistent state
- ✅ Rooms automatically cleanup within 24 hours

---

# **Implementation Plan**

## **Implementation Order**:

### **Phase 1: Token-Based Rejoining (Foundational)**
1. Add `rejoinToken` field to room participant structure
2. Modify `joinRoom()` logic for token+name matching
3. Update UI text to "Enter unique name"
4. Add sessionStorage token management

### **Phase 2: Stats Interface Changes (User-Facing)**  
5. Replace "Other People's Likes" with "Your Dislikes" tab
6. Remove "Take a Second Look" buttons
7. Add "Change to Like" buttons to dislikes

### **Phase 3: Cascade Updates (Complex Logic)**
8. Implement atomic all-or-nothing swipe updates
9. Add real-time synchronization for match updates

### **Phase 4: Cleanup (Background)**
10. Add 24-hour room deletion logic

## **Edge Cases Handled**
- Token persistence issues → Token+name fallback
- Name conflicts → UI guidance for unique names
- Multi-tab usage → Different names create different participants
- Cascade update failures → All-or-nothing approach prevents inconsistent states
- Room cleanup → Simple 24-hour rule appropriate for current scale

## **Out of Scope (Future Considerations)**
- Advanced participant cleanup based on activity
- Bi-directional swipe changes (like → dislike)
- Cross-device session synchronization
- Success feedback animations
- Token collision detection and resolution
- Advanced room persistence beyond 24 hours