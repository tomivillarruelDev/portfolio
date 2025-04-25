import { DocumentData } from '@angular/fire/compat/firestore';

// Corrección de tipos para @angular/fire/compat/firestore
declare module '@angular/fire/compat/firestore' {
  export interface DocumentSnapshotExists<T extends DocumentData>
    extends firebase.firestore.DocumentSnapshot {
    data(): T;
  }

  export interface QueryDocumentSnapshot<T extends DocumentData>
    extends firebase.firestore.QueryDocumentSnapshot {
    data(): T;
  }

  export interface QuerySnapshot<T extends DocumentData>
    extends firebase.firestore.QuerySnapshot {
    readonly docs: QueryDocumentSnapshot<T>[];
  }

  export interface DocumentChange<T extends DocumentData>
    extends firebase.firestore.DocumentChange {
    readonly doc: QueryDocumentSnapshot<T>;
  }
}
