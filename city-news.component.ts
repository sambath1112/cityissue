import { Component, OnInit } from '@angular/core';
import { CityNews } from '../shared/city-news.model';
import { CityNewsService } from '../shared/city-news.service';
import { MatDialog } from '@angular/material';
import { CityNewsDialogComponent } from '../city-news/city-news-dialog/city-news-dialog.component'

@Component({
  selector: 'app-city-news',
  providers: [CityNewsService, MatDialog],
  templateUrl: './city-news.component.html',
  styleUrls: ['./city-news.component.scss']
})
export class CityNewsComponent implements OnInit {
  cityNews: CityNews[] = [];
  cityNewsCategories: any[];

  constructor(private cityNewsService: CityNewsService, public dialog: MatDialog) { }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(CityNewsDialogComponent, {
      width: '600px',
      data: {
        action: 'Add',
        model: new CityNews(),
        categories: this.cityNewsCategories
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result && result.model) {
        this.cityNewsService.addCityNews(result.model)
          .subscribe(newCityNews => {
            console.log(newCityNews);
            this.cityNews.push(newCityNews);
          })
      }
    });
  }

  openEditDialog(data: CityNews): void {
    console.log(data);
    const dialogRef = this.dialog.open(CityNewsDialogComponent, {
      width: '600px',
      data: {
        action: 'Edit',
        model: Object.assign(new CityNews(), data),
        categories: this.cityNewsCategories
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result);
      if (result && result.model) {
        this.cityNewsService.editCityNews(result.model)
          .subscribe(cityEvent => {
            Object.assign(data, cityEvent);
          });
      }
    });
  }

  delete(data: CityNews) {
    this.cityNewsService.deleteCityNews(data)
      .subscribe((cityEvent) => {
        const index = this.cityNews.indexOf(data);
        this.cityNews.splice(index, 1);
        console.log('deleted');
      })
  }

  ngOnInit() {
    this.cityNewsService.getAllCityNews()
      .subscribe(cityNews => this.cityNews = cityNews);
    this.cityNewsService.getAllCategories()
      .subscribe(catgories => this.cityNewsCategories = catgories);
  }


}
