import { Component } from '@angular/core';
import { NavController, IonicPage, ActionSheetController, AlertController } from 'ionic-angular';
import { TaskProvider } from '../../providers/task/task';
import { Task } from '../../models/task';
import { AuthProvider } from '../../providers/auth/auth';


@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  tasks: any;
  task: Task;
  newTask = {name: ''};

  constructor(
    public navCtrl: NavController,
    private taskProvider: TaskProvider,
    public authProvider: AuthProvider,
    public actionSheetCtrl: ActionSheetController,
    public alertCtrl: AlertController,
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TaskListPage');
    this.getTasksList();
  }

  getTasksList() {
    // Use snapshotChanges().map() to store the key
    this.taskProvider.getTasksList().snapshotChanges().map(changes => {
      return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
    }).subscribe(tasks => {
      this.tasks = tasks;
    })
  }

  addTask(newTask) {
    this.taskProvider.createTask(newTask);
    this.newTask = {name: ''};
  }

  changeTask(index: number, key: string) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'タスクの変更',
      buttons: [
        {
          text: '削除',
          role: 'destructive',
          handler: () => {
            console.log('Destructive clicked');
            this.taskProvider.deleteTask(key);
          }
        }, {
          text: '変更',
          handler: () => {
            console.log('Archive clicked');
            this._renameTask(index, key);
          }
        }, {
          text: '閉じる',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }

  _renameTask(index: number, key: string) {
    let prompt = this.alertCtrl.create({
      title: '変更後のタスク',
      inputs: [
        {
          name: 'task',
          placeholder: 'タスク',
          value: this.tasks[index].name
        },
      ],
      buttons: [
        {
          text: '閉じる'
        },
        {
          text: '保存',
          handler: data => {
            // タスクのindex番目を書き換え
            this.tasks[index] = { name: data.task};
            // Firebaseに保存
            this.taskProvider.updateTask(key, {
              name: this.tasks[index].name, 
            });
          }
        }
      ]
    });
    prompt.present();
  }

  logout() {
    this.authProvider.logoutUser();
    this.navCtrl.setRoot('LoginPage');
  }

}